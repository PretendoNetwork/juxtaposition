import 'dotenv/config'
import { Pool } from "pg";
import Cursor from "pg-cursor"
import { createChannel, createClient, Metadata } from 'nice-grpc';
import { AccountServiceDefinition } from '@pretendonetwork/grpc/account/v2/account_service';

const POSTGRES_URL = process.env.POSTGRES_URL;
const GRPC_HOST = process.env.GRPC_HOST;
const GRPC_KEY = process.env.GRPC_KEY;

if (!POSTGRES_URL || !GRPC_HOST || !GRPC_KEY) {
	console.error("Missing POSTGRES_URL, GRPC_HOST or GRPC_KEY");
	process.exit(1);
}

const pool = new Pool({
	connectionString: POSTGRES_URL,
});
const readClient = await pool.connect();
const writeClient = await pool.connect();

const channel = createChannel(GRPC_HOST);
const grpc = createClient(AccountServiceDefinition, channel, {
	"*": {
		metadata: new Metadata({
			'X-API-Key': GRPC_KEY
		})
	}
});

async function main() {
	console.log("Starting migration");

	let migratedUsers = 0;
	const countResult = await pool.query('SELECT COUNT(*) AS count FROM users WHERE pnid IS NULL');
	const total = Number(countResult.rows[0].count);

	console.log(`--- Migrating ${total} users ---`)
	const cursor = readClient.query(new Cursor<{ pid: number }>(`SELECT * FROM users WHERE pnid IS NULL`));
	while (true) {
		const rows = await cursor.read(300);

		if (rows.length === 0) {
			break;
		}

		for (const row of rows) {
			const pid = row.pid;
			console.log(`[${migratedUsers+1}/${total}] Processing ${pid}`);
			try {
				const user = await grpc.getUserData({
					pid: pid
				});
				if (!user) {
					console.warn(`[WARN] Could not retrieve user data for ${pid}`);
					continue;
				}

				await writeClient.query(
					`UPDATE users SET pnid = $1, pnid_normalized = $2 WHERE pid = $3`,
					[
						user.username,
						user.username.toLowerCase(),
						user.pid
					]
				);
				migratedUsers++;
			} catch (err) {
				console.error(`Failed to migrate user ${pid}`, err);
			}
		}
	}

	console.log(`Done. Migrated ${migratedUsers} users.`);
}

await main().catch((err) => {
	console.error(err);
	process.exit(1);
});

channel.close();
readClient.release();
writeClient.release();
await pool.end();
