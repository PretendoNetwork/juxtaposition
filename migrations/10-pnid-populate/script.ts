import 'dotenv/config'
import { Client as PgClient } from "pg";
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

const pg = new PgClient({
	connectionString: POSTGRES_URL,
});
await pg.connect();

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
	console.log('--- Migrating users ---')
	const cursor = pg.query(new Cursor<{ pid: number }>(`SELECT * FROM users WHERE pnid IS NOT NULL`));
	while (true) {
		const rows = await cursor.read(50);

		if (rows.length === 0) {
			break;
		}

		for (const row of rows) {
			const pid = row.pid;
			console.log(`[${migratedUsers+1}] Processing ${pid}`);
			try {
				const user = await grpc.getUserData({
					pid: pid
				});
				if (!user) {
					console.warn(`[WARN] Could not retrieve user data for ${pid}`);
					continue;
				}

				await pg.query(
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
await pg.end();
