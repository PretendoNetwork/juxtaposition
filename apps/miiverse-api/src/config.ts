import { createConfig, zodV4SchemaToTransformer, loaders } from '@neato/config';
import * as z from 'zod';
import type { SchemaTransformer, SchemaTransformerContext } from '@neato/config';

// schema is mapped later to nested object to keep env vars consistent with other projects
const schema = z.object({
	log: z.object({
		format: z.enum(['json', 'pretty']).default('pretty'),
		level: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
		/** Enable or disable logging of sensitive HTTP headers (cookies, tokens etc.) in the JSON log */
		sensitive: z.stringbool().default(false)
	}).prefault({}),
	http: z.object({
		port: z.coerce.number().default(8080),
		/** Configures proxy trust (X-Forwarded-For etc.). Can be `true` to unconditionally trust, or
		 *  provide a numeric hop count, or comma-seperated CIDR ranges.
		 *  See https://expressjs.com/en/guide/behind-proxies.html
		 */
		trustProxy: z.union([z.coerce.number(), z.stringbool(), z.string()]).default(false)
	}).prefault({}),
	/** Whether to expose Prometheus metrics on a different port, path /metrics. */
	metrics: z.object({
		enabled: z.stringbool().default(false),
		port: z.coerce.number().default(9090)
	}).prefault({}),
	/** The AES key to use for decrypting service tokens. Must match the account server's. */
	aesKey: z.string(),
	/** CDN path hosting Mii images. ${cdnUrl}/mii/100000000/normal_face.png */
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
		}),
		server: z.object({
			port: z.coerce.number().default(8125),
			apiKey: z.string()
		})
	})
});

export const presets: Record<string, any> = {
	docker: {
		http: {
			trustProxy: 'loopback'
		},
		aesKey: '1234567812345678123456781234567812345678123456781234567812345678',
		cdnUrl: 'http://cdn.pretendo.cc/miiverse',
		mongoose: {
			uri: 'mongodb://localhost:27017/miiverse?directConnection=true'
		},
		s3: {
			endpoint: 'http://localhost:9000',
			key: 'minioadmin',
			secret: 'minioadmin',
			bucket: 'miiverse',
			region: 'us-east-1'
		},
		grpc: {
			friends: {
				host: 'localhost',
				port: 8124,
				apiKey: '12345678123456781234567812345678'
			},
			account: {
				host: 'localhost',
				port: 8123,
				apiKey: '12345678123456781234567812345678'
			},
			server: {
				port: 8125,
				apiKey: '12345678123456781234567812345678'
			}
		}
	}
};

function flatZodSchema<T extends z.ZodType>(schema: T): SchemaTransformer<z.infer<T>> {
	const transformer = zodV4SchemaToTransformer<z.infer<T>>(schema);
	return {
		extract: () => transformer.extract().map(v => ({
			...v,
			normalizedKey: v.normalizedKey.replaceAll('__', '_')
		})),
		validate: (ctx: SchemaTransformerContext) => transformer.validate(ctx)
	};
}

export const config = createConfig({
	envPrefix: 'PN_MIIVERSE_API_',
	presetKey: 'usePresets',
	presets,
	loaders: [
		loaders.environment(),
		loaders.file('.env'),
		loaders.file('config.json')
	],
	schema: flatZodSchema(schema)
});
