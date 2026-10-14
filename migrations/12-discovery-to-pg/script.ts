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
const endpointsColl = db.collection<Endpoint>("endpoints");

type Endpoint = {
	_id: ObjectId;
	status: number;
	server_access_level: string;
	topics: boolean;
	guest_access: boolean;
	new_users: boolean;
	host: string;
	api_host: string;
	portal_host: string;
	n3ds_host: string;
};

const pg = new PgClient({
	connectionString: POSTGRES_URL,
});
await pg.connect();

async function main() {
	console.log("Starting migration");

	console.log('--- Migrating endpoints ---')
	let migratedEndpoints = 0;
	const endpointsCursor = endpointsColl.find({});
	while (await endpointsCursor.hasNext()) {
		const endpoint = await endpointsCursor.next();
		if (!endpoint) {
			console.warn(`Skipping endpoint doc: Received null`);
			continue;
		}
		console.log(`Processing ${endpoint._id}`);

		try {
			await pg.query("BEGIN");

			await pg.query(
				`
				INSERT INTO discovery_endpoints (
					id,
					created_at,
					server_access_level,
					status,
					api_host,
					wup_host,
					ctr_host,
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				ON CONFLICT (id) DO NOTHING
				`,
				[
					endpoint._id.toString(),
					endpoint._id.getTimestamp(),
					endpoint.server_access_level, // TODO convert
					endpoint.status,
					endpoint.api_host,
					endpoint.portal_host,
					endpoint.n3ds_host,
				]
			);
			migratedEndpoints++;
		} catch (err) {
			await pg.query("ROLLBACK");
			console.error(`Failed to migrate endpoint ${endpoint._id}`, err);
		}
	}

	console.log(`Done. Migrated ${migratedEndpoints} endpoints.`);
}

await main().catch((err) => {
	console.error(err);
	process.exit(1);
});

await pg.end();
await mongo.close();
