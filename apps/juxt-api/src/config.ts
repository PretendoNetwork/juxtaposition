import { zodCoercedBoolean, createConfigLoader } from '@neato/config';
import { z } from 'zod';

const schema = z.object({
	http: z.object({
		port: z.coerce.number().default(8080)
	}).default({}),
	accountServerAddress: z.string(),
	aesKey: z.string(),
	mongoose: z.object({
		uri: z.string(),
		options: z.object({
			useNewUrlParser: zodCoercedBoolean().default(true),
			useUnifiedTopology: zodCoercedBoolean().default(true),
			tls: zodCoercedBoolean().default(false),
			replicaSet: z.string().optional()
		}).default({})
	}),
	s3: z.object({
		endpoint: z.string(),
		key: z.string(),
		secret: z.string()
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
	})
});

export const conf = createConfigLoader()
	.addFromEnvironment('JXTAPI_')
	.addFromFile('.env', { prefix: 'JXTAPI_' })
	.addFromFile('config.json')
	.addZodSchema(schema)
	.load();
