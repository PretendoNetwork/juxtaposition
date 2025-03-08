import { zodCoercedBoolean, createConfigLoader } from '@neato/config';
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
		uri: z.string(),
		database: z.string(),
		options: z.object({
			useNewUrlParser: zodCoercedBoolean().default(true),
			useUnifiedTopology: zodCoercedBoolean().default(true),
			directConnection: zodCoercedBoolean().default(true),
			tls: zodCoercedBoolean().default(false),
			replicaSet: z.string().optional()
		}).default({})
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

export const conf = createConfigLoader()
	.addFromEnvironment('JXTUI_')
	.addFromFile('.env', { prefix: 'JXTUI_' })
	.addFromFile('config.json')
	.addZodSchema(schema)
	.load();
