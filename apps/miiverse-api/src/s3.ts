import { S3Client } from '@aws-sdk/client-s3';
import { config } from '@/config';

let s3: S3Client | null = null;

export function getS3() {
	if (!s3) {
		throw new Error('S3 not configured yet');
	}
	return s3;
}

export function setupS3() {
	s3 = new S3Client({
		endpoint: config.s3.endpoint,
		forcePathStyle: true,
		region: config.s3.region,
		credentials: {
			accessKeyId: config.s3.key,
			secretAccessKey: config.s3.secret
		}
	});
}
