import 'dotenv/config'
import { MongoClient, ObjectId } from "mongodb";
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
const rulesColl = db.collection<AutomodRule>("automodrules");
const logsColl = db.collection<AutomodLog>("automodlogs");

type AutomodLogMatch = {
	start: number;
	end: number;
};

type AutomodAction = 'blocked' | 'logged';

type AutomodLog = {
	_id: ObjectId;
	rule_id: string;
	created_at: Date;
	author: number;
	action: AutomodAction;
	post_id: string | null;
	parent_post_id: string | null;
	community_id: string | null;
	matches: AutomodLogMatch[] | null;
	post_content_body: string | null;
};

type AutomodRuleType = 'keyword';
type AutomodRuleMode = 'block' | 'log';

type AutomodRule = {
	_id: ObjectId;
	enabled: boolean;
	created_at: Date;
	title: string;
	description: string | null;
	type: AutomodRuleType;
	mode: AutomodRuleMode;
	keyword_settings: {
		keywords: string[];
	};
}

const automodRuleTypeMapping: Record<AutomodRuleType, string> = {
	keyword: 'Keyword'
};
const automodRuleModeMapping: Record<AutomodRuleMode, string> = {
	block: 'Block',
	log: 'Log'
};
const automodActionMapping: Record<AutomodAction, string> = {
	blocked: 'Blocked',
	logged: 'Logged'
};

const pg = new PgClient({
	connectionString: POSTGRES_URL,
});
await pg.connect();

async function main() {
	console.log("Starting migration");

	console.log('--- Migrating automod rules ---')
	let migratedRules = 0;
	const rulesCursor = rulesColl.find({});
	while (await rulesCursor.hasNext()) {
		const rule = await rulesCursor.next();
		if (!rule) {
			console.warn(`Skipping rule doc: Received null`);
			continue;
		}
		console.log(`Processing ${rule._id}`);

		try {
			await pg.query("BEGIN");

			await pg.query(
				`
				INSERT INTO automod_rules (
					id,
					created_at,
					title,
					description,
					enabled,
					type,
					mode,
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				ON CONFLICT (id) DO NOTHING
				`,
				[
					rule._id.toString(),
					rule.created_at,
					rule.title,
					rule.description ?? null,
					rule.enabled,
					automodRuleTypeMapping[rule.type],
					automodRuleModeMapping[rule.mode],
				]
			);

			if (rule.type === 'keyword') {
				await pg.query(
					`
					INSERT INTO automod_rule_keyword_settings (
						rule_id,
						keywords,
					)
					VALUES ($1, $2)
					ON CONFLICT (rule_id) DO NOTHING
					`,
					[
						rule._id.toString(),
						rule.keyword_settings.keywords,
					]
				);
			}

			await pg.query("COMMIT");

			migratedRules++;
		} catch (err) {
			await pg.query("ROLLBACK");
			console.error(`Failed to migrate automod rule ${rule._id}`, err);
		}
	}

	console.log('--- Migrating automod logs ---')
	let migratedLogs = 0;
	const logsCursor = logsColl.find({});
	while (await logsCursor.hasNext()) {
		const log = await logsCursor.next();
		if (!log) {
			console.warn(`Skipping log doc: Received null`);
			continue;
		}
		console.log(`Processing ${log._id}`);

		try {
			await pg.query("BEGIN");

			await pg.query(
				`
				INSERT INTO automod_logs (
					id,
					created_at,
					rule_id,
					author,
					action,
					post_content_body,
					matches,
					post_id,
					parent_post_id,
					community_id,
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
				ON CONFLICT (id) DO NOTHING
				`,
				[
					log._id.toString(),
					log.created_at,
					log.rule_id,
					log.author,
					automodActionMapping[log.action],
					log.post_content_body ?? null,
					log.matches ?? null,
					log.post_id ?? null,
					log.parent_post_id ?? null,
					log.community_id ?? null,
				]
			);

			await pg.query("COMMIT");

			migratedLogs++;
		} catch (err) {
			await pg.query("ROLLBACK");
			console.error(`Failed to migrate automod log ${log._id}`, err);
		}
	}

	console.log(`Done. Migrated ${migratedRules} automod rules and ${migratedLogs} automod logs.`);
}

await main().catch((err) => {
	console.error(err);
	process.exit(1);
});

await pg.end();
await mongo.close();
