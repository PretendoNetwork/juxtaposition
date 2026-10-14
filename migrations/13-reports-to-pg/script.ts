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
const reportsColl = db.collection<Report>("reports");

type Report = {
	_id: ObjectId;
	pid: number;
	reported_by: number;
	post_id: string;
	reason: number;
	message: string;
	created_at: Date;
	resolved?: boolean | null;
	note?: string | null;
	resolved_by?: number | null;
	resolved_at?: Date | null;
};

const pg = new PgClient({
	connectionString: POSTGRES_URL,
});
await pg.connect();

async function main() {
	console.log("Starting migration");

	console.log('--- Migrating reports ---')
	let migratedReports = 0;
	const reportsCursor = reportsColl.find({});
	while (await reportsCursor.hasNext()) {
		const report = await reportsCursor.next();
		if (!report) {
			console.warn(`Skipping report doc: Received null`);
			continue;
		}
		console.log(`Processing ${report._id}`);

		try {
			await pg.query("BEGIN");

			await pg.query(
				`
				INSERT INTO reports (
					id,
					post_id,
					post_author,
					created_at,
					reported_by,
					report_reasonId,
					report_message,
					resolved,
					resolved_at,
					resolved_by,
					moderation_note,
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
				ON CONFLICT (id) DO NOTHING
				`,
				[
					report._id.toString(),
					report.post_id,
					report.pid,
					report.created_at,
					report.reported_by,
					report.reason,
					report.message,
					report.resolved ?? false,
					report.resolved_at ?? null,
					report.reported_by ?? null,
					report.note ?? null,
				]
			);
			migratedReports++;
		} catch (err) {
			await pg.query("ROLLBACK");
			console.error(`Failed to migrate report ${report._id}`, err);
		}
	}

	console.log(`Done. Migrated ${migratedReports} reports.`);
}

await main().catch((err) => {
	console.error(err);
	process.exit(1);
});

await pg.end();
await mongo.close();
