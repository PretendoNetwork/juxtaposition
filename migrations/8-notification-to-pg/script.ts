import 'dotenv/config'
import { MongoClient, type Document } from "mongodb";
import { Client as PgClient } from "pg";
import { randomUUID } from "node:crypto";

const MONGO_URI = process.env.MONGO_URI;
const POSTGRES_URL = process.env.POSTGRES_URL;

if (!MONGO_URI || !POSTGRES_URL) {
    console.error("Missing MONGO_URI or POSTGRES_URL");
    process.exit(1);
}

const mongo = new MongoClient(MONGO_URI);
await mongo.connect();

const db = mongo.db();
const notifications = db.collection("notifications");

const pg = new PgClient({
	connectionString: POSTGRES_URL,
});
await pg.connect();

function parseDateString(str: string): Date {
	if (str == "null" || str == "Invalid date") {
		return new Date();
	} else {
		return new Date(str);
	}
}

function createMetaFromDoc(doc: Document): { type: string, content: Record<string, any>}  | null {
	if (doc.type === 'follow') {
		const users = doc.users.map((v: any) => ({
			timestamp: v.timestamp,
			pid: Number(v.user),
		}));
		return {
			type: 'Follow',
			content: {
				users,
			}
		}
	}

	if (doc.type === 'notice') {
		const text = doc.text;

		// post removal with reason
		// Formats:
		// * Your post "hKikmHAKf8c8RFCK2avCn" has been removed for the following reason: "test reason"
		// * Your post "hKikmHAKf8c8RFCK2avCn" has been removed for the following reason: "test reason". Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/juxt-mods/).
		// * Your comment "hKikmHAKf8c8RFCK2avCn" has been removed for the following reason: "test reason". Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/juxt-mods/).
		if (text.startsWith("Your") && text.includes("has been removed for")) {
			const postType = text.startsWith("Your comment") ? 'comment' : 'post';
			if (postType === 'post' && !text.startsWith("Your post")) {
				console.warn(`Could not determine post type ${doc._id}: "${text}"`)
				return null;
			}
			const [_,__,postId,reason] = text.match(/your (post|comment) "([^"]+)" [\s\S]*reason: "([\s\S]*)"(\.? ?Click this message |$)/i)
			if (!postId || !reason) {
				console.warn(`Could not extract reason and postId ${doc._id}: "${text}"`)
				return null;
			}
			return {
				type: 'PostDeleted',
				content: {
					postId,
					reason,
					postType,
				}
			}
		}

		// post removal without reason
		// Formats:
		// * Your post "hKikmHAKf8c8RFCK2avCn" has been removed. Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/juxt-mods/).
		// * Your comment "hKikmHAKf8c8RFCK2avCn" has been removed. Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/juxt-mods/).
		if (text.startsWith("Your") && text.includes("has been removed")) {
			const postType = text.startsWith("Your comment") ? 'comment' : 'post';
			if (postType === 'post' && !text.startsWith("Your post")) {
				console.warn(`Could not determine post type ${doc._id}: "${text}"`)
				return null;
			}
			const [_,__,postId] = text.match(/your (post|comment) "([^"]*)"/i)
			if (!postId) {
				console.warn(`Could not extract postId ${doc._id}: "${text}"`)
				return null;
			}
			return {
				type: 'PostDeleted',
				content: {
					postId,
					reason: undefined,
					postType,
				}
			}
		}

		// Limited from posting with date
		// Formats:
		// * You have been Limited from Posting until Jun 11, 2026, 11:16 PM UTC. Reason: "test reason". Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).
		// * You have been Limited from Posting until Jun 11, 2026, 11:16 PM UTC. Reason: "test reason".Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).
		// * You have been Limited from Posting until Jun 11, 2026, 11:16 PM UTC. Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).
		// * You have been Limited from Posting until Wed Jun 11 2025 23:44:00 GMT+0000. Reason: "test reason". If you have any questions contact the moderators in the Discord server or forum
		// Dates can be "null" or "Invalid date" as well
		if (text.toLowerCase().includes("limited from posting until")) {
			const [_,dateStr] = text.match(/Posting until ([^.]+)\./i);
			if (!dateStr) {
				console.warn(`Could not extract date ${doc._id}: "${text}"`)
				return null;
			}

			let reason: undefined | string;
			if (text.includes("Reason:")) {
				const [_,reason] = text.match(/Reason: "([\s\S]*)"\.? ?(Click this message|If you have any questions)/i);
				if (reason === undefined) {
					console.warn(`Could not extract reason ${doc._id}: "${text}"`)
					return null;
				}
			}

			return {
				type: 'LimitedFromPosting',
				content: {
					until: parseDateString(dateStr).toISOString(),
					reason,
				}
			}
		}

		// Limited from posting without date
		// formats:
		// * You have been Limited from Posting. Reason: "test reason". Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).
		// * You have been Limited from Posting. Reason: "test reason".Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).
		// * You have been Limited from Posting. Click this message to view the Juxtaposition Code of Conduct. If you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).
		if (text.toLowerCase().includes("limited from posting")) {
			let reason: undefined | string;
			if (text.includes("Reason:")) {
				const [_,reason] = text.match(/Reason: "([\s\S]*)"\.? ?(Click this message|If you have any questions)/i);
				if (reason === undefined) {
					console.warn(`Could not extract reason ${doc._id}: "${text}"`)
					return null;
				}
			}

			return {
				type: 'LimitedFromPosting',
				content: {
					until: undefined,
					reason,
				}
			}
		}
	}

	if (doc.type === 'notice') {
		console.warn(`Recieved generic notice for notification ${doc._id}: "${doc.text}"`)
		return {
			type: 'System',
			content: {
				text: doc.text,
				link: doc.link,
				imagePath: doc.image,
			}
		}
	}

	return null; // Unknown type
}

async function main() {
	console.log("Starting migration");
    const cursor = notifications.find({});
    let migrated = 0;

    while (await cursor.hasNext()) {
        const notification = await cursor.next();
		if (!notification) {
            console.warn(`Skipping document: Received null`);
			continue;
		}
		console.log(`Processing ${notification._id}`);

		let meta;
		try {
			meta = createMetaFromDoc(notification);
		} catch (err) {
			console.warn(err, `Skipping ${notification._id}: Content extraction broke: ${notification.text}`);
			continue;
		}
        if (!meta) {
            console.warn(`Skipping ${notification._id}: No content found`);
            continue;
        }

        try {
			await pg.query("BEGIN");

			const notifId = randomUUID();
			const createdAt = notification._id.getTimestamp()
			await pg.query(
				`
				INSERT INTO notifications (
					id,
					type,
					content,
					created_at,
					updated_at
				)
				VALUES ($1, $2, $3::jsonb, $4, $5)
				`,
				[
					notifId,
					meta.type,
					JSON.stringify(meta.content),
					createdAt,
					notification.lastUpdated ?? createdAt,
				]
			);

			await pg.query(
				`
				INSERT INTO notification_recipients (
					id,
					pid,
					has_read,
					notification_id
				)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT (id) DO NOTHING
				`,
				[
					randomUUID(),
					Number(notification.pid),
					notification.read ?? false,
					notifId,
				]
			);

			await pg.query("COMMIT");

			migrated++;
		} catch (err) {
			await pg.query("ROLLBACK");
			console.error(`Failed to migrate notification ${notification._id}`, err);
		}
    }

    console.log(`Done. Migrated ${migrated} notifications.`);

}

await main().catch((err) => {
    console.error(err);
    process.exit(1);
});

await pg.end();
await mongo.close();
