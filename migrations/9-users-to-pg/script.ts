import 'dotenv/config'
import { MongoClient } from "mongodb";
import { Client as PgClient } from "pg";

const MONGO_URI = process.env.MONGO_URI;
const POSTGRES_URL = process.env.POSTGRES_URL;

if (!MONGO_URI || !POSTGRES_URL) {
	console.error("Missing MONGO_URI or POSTGRES_URL");
	process.exit(1);
}

const mongo = new MongoClient(MONGO_URI);
await mongo.connect();

const db = mongo.db();
const contentColl = db.collection("contents");
const settingsColl = db.collection("settings");

const pg = new PgClient({
	connectionString: POSTGRES_URL,
});
await pg.connect();

async function main() {
	console.log("Starting migration");

	console.log('--- Migrating users ---')
	let migratedUsers = 0;
	const settingsCursor = settingsColl.find({});
	while (await settingsCursor.hasNext()) {
		const settings = await settingsCursor.next();
		if (!settings) {
			console.warn(`Skipping settings doc: Received null`);
			continue;
		}
		console.log(`Processing ${settings.pid}`);

		try {
			await pg.query("BEGIN");

			await pg.query(
				`
				INSERT INTO users (
					pid,
					created_at,
					display_name,
					last_seen,
					account_status,
					ban_reason,
					ban_ends_at,
					banned_by
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				ON CONFLICT (pid) DO NOTHING
				`,
				[
					settings.pid,
					settings.created_at ?? settings._id.getTimestamp(), // Can be undefined
					settings.screen_name,
					settings.last_active ?? settings.created_at ?? settings._id.getTimestamp(),
					settings.account_status,
					settings.ban_reason ?? null,
					settings.ban_lift_date ?? null,
					settings.banned_by ?? null,
				]
			);

			await pg.query(
				`
				INSERT INTO user_settings (
					pid,
					receive_notifications,
					profile_privacy,
					is_favourite_community_visible,
					is_country_visible,
					is_relationship_visible,
					is_birthday_visible,
					is_game_skill_visible,
					profile_comment,
					game_skill
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
				ON CONFLICT (pid) DO NOTHING
				`,
				[
					settings.pid,
					settings.receive_notifications,
					settings.profile_visibility === 'users_only' ? 'UsersOnly' : 'Public', // Can be undefined. Fall back to `Public`
					settings.profile_favorite_community_visibility,
					settings.country_visibility,
					settings.relationship_visibility,
					settings.birthday_visibility,
					settings.game_skill_visibility,
					settings.profile_comment_visibility ?
						(settings.profile_comment?.trim() ? settings.profile_comment : null) :
						null,
					settings.game_skill,
				]
			);

			await pg.query("COMMIT");

			migratedUsers++;
		} catch (err) {
			await pg.query("ROLLBACK");
			console.error(`Failed to migrate user ${settings.pid}`, err);
		}
	}

	console.log('--- Migrating content ---')
	let migratedContent = 0;
	const contentCursor = contentColl.find({});
	while (await contentCursor.hasNext()) {
		const content = await contentCursor.next();
		if (!content) {
			console.warn(`Skipping content doc: Received null`);
			continue;
		}
		console.log(`Processing ${content.pid}`);

		try {
			const follows = (content.followed_users as number[] ?? []).filter(v=>v && v > 0);
			await migrateFollower(content.pid, follows);

			const communityIds = (content.followed_communities as string[] ?? []).filter(v=>v && v.length > 0);
			if (communityIds.length > 0) {
				const values = communityIds
				.map((_, i) => `($1, $${i + 2})`)
				.join(", ");

				await pg.query(
					`
					INSERT INTO community_follows (pid, community_id)
					VALUES ${values}
					ON CONFLICT DO NOTHING
					`,
					[
						content.pid,
						...communityIds,
					]
				);
			}

			migratedContent++;
		} catch (err) {
			console.error(`Failed to migrate content ${content.pid}`, err);
		}
	}

	console.log(`Done. Migrated ${migratedUsers} users and ${migratedContent} content entities.`);
}

await main().catch((err) => {
	console.error(err);
	process.exit(1);
});

await pg.end();
await mongo.close();

async function migrateFollower(pid: number, targetPids: number[]) {
	let finalTargetPids = [...targetPids];

	while (true) {
		try {
			if (finalTargetPids.length > 0) {
				const values = finalTargetPids
				.map((_, i) => `($1, $${i + 2})`)
				.join(", ");

				await pg.query(
					`
					INSERT INTO user_follows (pid, following_pid)
					VALUES ${values}
					ON CONFLICT DO NOTHING
					`,
					[
						pid,
						...finalTargetPids,
					]
				);
			}
			return; // Success
		} catch (err: any) {
			if (err && err.code === '23503' && err.constraint === 'user_follows_following_pid_fkey') {
				const match = (err.detail as string ?? '').match(/\(following_pid\)=\((\d+)\)/);
				if (!match || !match[1]) {
					console.error("Failed to extract pid from error detail", err);
					throw err;
				}
				const pidToRemove = Number(match[1])
				finalTargetPids = finalTargetPids.filter(v=>v!==pidToRemove);
				console.error(`Cannot follow nonexisting user: ${pidToRemove} - removing follow and reimporting followers for ${pid}`)
				continue; // Retry
			}
			throw err;
		}
	}
}
