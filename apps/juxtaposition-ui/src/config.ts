import { createConfigLoader } from '@neato/config';
import { z } from 'zod';

const schema = z.object({
	http: z.object({
		port: z.coerce.number().default(80)
	}).default({}),
	postLimit: z.coerce.number().default(10),
	accountServerDomain: z.string(),
	miiImageCdn: z.string(),
	cdnDomain: z.string(),
	whitelist: z.string(),
	serverEnvironment: z.string(),
	aesKey: z.string(),
	mongoose: z.object({
		uri: z.string()
	}),
	grpc: z.object({
		friends: z.object({
			host: z.string(),
			port: z.string(),
			api_key: z.string().optional()
		}),
		account: z.object({
			host: z.string(),
			port: z.string(),
			api_key: z.string().optional()
		})
	}),
	aws: z.object({
		spaces: z.object({
			key: z.string(),
			secret: z.string()
		}),
		endpoint: z.string(),
		region: z.string(),
		bucket: z.string()
	}),
	redis: z.object({
		host: z.string(),
		port: z.coerce.number().default(6379)
	})
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
			uri: 'mongodb://localhost:27017/miiverse'
		},
		aws: {
			spaces: {
				key: 'xyz',
				secret: 'xyz'
			},
			endpoint: 'http://localstack:4567',
			region: 'us-east-1',
			bucket: 'miiverse'
		},
		redis: {
			host: 'localhost'
		}
	}
};

export const conf = createConfigLoader()
	.addFromEnvironment('JXTUI_')
	.addFromFile('.env', { prefix: 'JXTUI_' })
	.addFromFile('config.json')
	.addZodSchema(schema)
	.addConfigFragments(fragments)
	.load();
