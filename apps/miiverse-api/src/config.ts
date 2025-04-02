import { createConfigLoader } from '@neato/config';
import { z } from 'zod';

const schema = z.object({
	http: z.object({
		port: z.coerce.number().default(8080)
	}).default({}),
	accountServerAddress: z.string(),
	aesKey: z.string(),
	cdnUrl: z.string().url().transform(s => s.replace(/\/$/g, '')),
	mongoose: z.object({
		uri: z.string()
	}),
	s3: z.object({
		endpoint: z.string(),
		key: z.string(),
		secret: z.string(),
		bucket: z.string(),
		region: z.string()
	}),
	grpc: z.object({
		friends: z.object({
			host: z.string(),
			port: z.string(),
			apiKey: z.string()
		}),
		account: z.object({
			host: z.string(),
			port: z.string(),
			apiKey: z.string()
		})
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
		s3: {
			endpoint: 'http://localstack:4567',
			key: 'xyz',
			secret: 'xyz',
			bucket: 'juxt',
			region: 'us-east-1'
		}
	}
};

export const conf = createConfigLoader()
	.addFromEnvironment('JXTAPI_')
	.addFromFile('.env', { prefix: 'JXTAPI_' })
	.addFromFile('config.json')
	.addZodSchema(schema)
	.addConfigFragments(fragments)
	.setFragmentKey('USE_PRESETS')
	.load();
