import { createConfigLoader } from '@neato/config';
import { z } from 'zod';

// schema is mapped later to nested object to keep env vars consistent with other projects
const schema = z.object({
	httpPort: z.coerce.number().default(8080),
	accountServerAddress: z.string(),
	aesKey: z.string(),
	cdnUrl: z.string().url().transform(s => s.replace(/\/$/g, '')),
	mongooseUri: z.string(),
	s3Endpoint: z.string(),
	s3Key: z.string(),
	s3Secret: z.string(),
	s3Bucket: z.string(),
	s3Region: z.string(),
	grpcFriendsHost: z.string(),
	grpcFriendsPort: z.string(),
	grpcFriendsApiKey: z.string(),
	grpcAccountHost: z.string(),
	grpcAccountPort: z.string(),
	grpcAccountApiKey: z.string()
});

export const fragments: Record<string, any> = {
	docker: {
		http: {
			cors: 'http://localhost:3000 http://localhost:5173',
			frontendBaseUrl: 'http://localhost:5173/',
			backendBaseUrl: 'http://localhost:8080/'
		},
		aesKey: '123456',
		mongoose: {
			uri: 'mongodb://localhost:27017/miiverse?directConnection=true'
		},
		s3: {
			endpoint: 'http://localstack:4567',
			key: 'xyz',
			secret: 'xyz',
			bucket: 'juxt',
			region: 'us-east-1'
		}
	}
};

const unmappedConfig = createConfigLoader()
	.addFromEnvironment('PN_MIIVERSE_API_')
	.addFromFile('.env', { prefix: 'PN_MIIVERSE_API_' })
	.addFromFile('config.json')
	.addZodSchema(schema)
	.addConfigFragments(fragments)
	.setFragmentKey('USE_PRESETS')
	.load();

export const config = {
	http: {
		port: unmappedConfig.httpPort
	},
	accountServerAddress: unmappedConfig.accountServerAddress,
	aesKey: unmappedConfig.aesKey,
	cdnUrl: unmappedConfig.cdnUrl,
	mongoose: {
		uri: unmappedConfig.mongooseUri
	},
	s3: {
		endpoint: unmappedConfig.s3Endpoint,
		key: unmappedConfig.s3Key,
		secret: unmappedConfig.s3Secret,
		bucket: unmappedConfig.s3Bucket,
		region: unmappedConfig.s3Region
	},
	grpc: {
		friends: {
			host: unmappedConfig.grpcFriendsHost,
			port: unmappedConfig.grpcFriendsPort,
			apiKey: unmappedConfig.grpcFriendsApiKey
		},
		account: {
			host: unmappedConfig.grpcAccountHost,
			port: unmappedConfig.grpcAccountPort,
			apiKey: unmappedConfig.grpcAccountApiKey
		}
	}
};
