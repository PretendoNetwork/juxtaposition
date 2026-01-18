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
		cookieDomain: z.string().default('.pretendo.network'),
		/** "Safe" base origin for login-redirect validation */
		baseUrl: z.string().default('https://juxt.pretendo.network'),
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
	/** Maximum posts per-page to show on most feeds. Higher settings increase DB load. */
	postLimit: z.coerce.number().default(10),
	/** CDN path hosting Mii images, icons, etc. ${cdnDomain}/mii/100000000/normal_face.png */
	cdnDomain: z.string(),
	/** Value for X-Nintedo-Whitelist header. */
	whitelist: z.string(),
	/** Environment (prod/test/dev) to use for Discovery and access_level control. */
	serverEnvironment: z.string(),
	/** By default, only consoles can reach the console domains. This setting disable that constraint */
	disableConsoleChecks: z.stringbool().default(false),
	/** The AES key to use for decrypting service tokens. Must match the account server's. */
	aesKey: z.string(),
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
		miiverse: z.object({
			host: z.string(),
			port: z.string(),
			apiKey: z.string()
		})
	}),
	redis: z.object({
		host: z.string(),
		port: z.coerce.number().default(6379)
	})
});

export const presets = {
	docker: {
		http: {
			port: 5173,
			trustProxy: 'loopback'
		},
		cdnDomain: 'https://cdn.pretendo.cc/miiverse',
		whitelist: '',
		serverEnvironment: 'prod',
		disableConsoleChecks: true,
		aesKey: '1234567812345678123456781234567812345678123456781234567812345678',
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
			miiverse: {
				host: 'localhost',
				port: 8125,
				apiKey: '12345678123456781234567812345678'
			}
		},
		redis: {
			host: 'localhost'
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
	envPrefix: 'PN_JUXTAPOSITION_UI_',
	presetKey: 'usePresets',
	presets,
	loaders: [
		loaders.environment(),
		loaders.file('.env'),
		loaders.file('config.json')
	],
	schema: flatZodSchema(schema)
});
