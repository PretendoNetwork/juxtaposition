import { logger } from '@/logger';
import { Post } from '@/models/post';
import { bulkDeleteCDNAsset } from '@/util';
import type { DeleteAccountDataRequest, DeleteAccountDataResponse } from '@pretendonetwork/grpc/miiverse/v2/delete_account_data_rpc';

const pageLimit = 50;

function cleanCdnKey(key: string): string {
	return key.startsWith('/') ? key.slice(1) : key;
}

export async function deleteAccountData(req: DeleteAccountDataRequest): Promise<DeleteAccountDataResponse> {
	logger.info(`Deleting account ${req.pid}...`);
	let totalCdnDeletions = 0;
	let totalDeleted = 0;
	let hasMoreToDelete = true;
	while (hasMoreToDelete) {
		const posts = await Post.find({
			pid: req.pid
		}).limit(pageLimit);

		const cdnKeysOrNull = posts.map((msg) => {
			return [
				msg.painting ? `paintings/${msg.pid}/${msg.id}.png` : null,
				msg.screenshot ? cleanCdnKey(msg.screenshot) : null,
				msg.screenshot_thumb ? cleanCdnKey(msg.screenshot_thumb) : null
			];
		}).flat();
		const cdnKeys = cdnKeysOrNull.filter((v): v is string => !!v);
		await bulkDeleteCDNAsset(cdnKeys); // ignore return value, continue on error
		totalCdnDeletions += cdnKeys.length;

		await Post.deleteMany({
			_id: {
				$in: posts.map(v => v._id)
			}
		});

		totalDeleted += posts.length;
		hasMoreToDelete = posts.length !== 0;
	}

	logger.info(`Deleted account ${req.pid} (${totalDeleted} posts, ${totalCdnDeletions} CDN files)`);
	return {
		hasDeleted: totalDeleted > 0,
		postsDeleted: totalDeleted
	};
}
