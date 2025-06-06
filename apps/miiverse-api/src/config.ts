import { createConfigLoader, zodCoercedBoolean } from '@neato/config';
import { z } from 'zod';

// schema is mapped later to nested object to keep env vars consistent with other projects
const schema = z.object({
	logFormat: z.enum(['json', 'pretty']).default('pretty'),
	logLevel: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
	/** Enable or disable logging of sensitive HTTP headers (cookies, tokens etc.) in the JSON log */
	logSensitive: zodCoercedBoolean().default(false),
	httpPort: z.coerce.number().default(8080),
	/** Configures proxy trust (X-Forwarded-For etc.). Can be `true` to unconditionally trust, or
	 *  provide a numeric hop count, or comma-seperated CIDR ranges.
	 *  See https://expressjs.com/en/guide/behind-proxies.html
	 */
	httpTrustProxy: z.union([zodStrictBoolean(), z.coerce.number(), z.string()]).default(false),
	/** Whether to expose Prometheus metrics on a different port, path /metrics. */
	metricsEnabled: zodCoercedBoolean().default(false),
	metricsPort: z.coerce.number().default(9090),
	/** The AES key to use for decrypting service tokens. Must match the account server's. */
	aesKey: z.string(),
	/** CDN path hosting Mii images. ${cdnUrl}/mii/100000000/normal_face.png */
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
	grpcAccountApiKey: z.string(),
	grpcServerPort: z.coerce.number().default(8125),
	grpcServerApiKey: z.string()
});

export const fragments: Record<string, any> = {
	docker: {
		httpCors: 'http://localhost:3000 http://localhost:5173',
		httpFrontendBaseUrl: 'http://localhost:5173/',
		httpBackendBaseUrl: 'http://localhost:8080/',
		httpTrustProxy: 'loopback',
		aesKey: '1234567812345678123456781234567812345678123456781234567812345678',
		mongooseUri: 'mongodb://localhost:27017/miiverse?directConnection=true',
		s3Endpoint: 'http://localhost:9000',
		s3Key: 'minioadmin',
		s3Secret: 'minioadmin',
		s3Bucket: 'miiverse',
		s3Region: 'us-east-1',
		cdnUrl: 'http://cdn.pretendo.cc/miiverse',
		grpcAccountHost: 'localhost',
		grpcAccountPort: 8123,
		grpcAccountApiKey: '12345678123456781234567812345678',
		grpcFriendsHost: 'localhost',
		grpcFriendsPort: 8124,
		grpcFriendsApiKey: '12345678123456781234567812345678',
		grpcServerPort: 8125,
		grpcServerApiKey: '12345678123456781234567812345678'
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
	log: {
		format: unmappedConfig.logFormat,
		level: unmappedConfig.logLevel,
		sensitive: unmappedConfig.logSensitive
	},
	http: {
		port: unmappedConfig.httpPort,
		trustProxy: unmappedConfig.httpTrustProxy
	},
	metrics: {
		enabled: unmappedConfig.metricsEnabled,
		port: unmappedConfig.metricsPort
	},
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
		},
		server: {
			port: unmappedConfig.grpcServerPort,
			apiKey: unmappedConfig.grpcServerApiKey
		}
	}
};

/**
 * An "even stricter" boolean parser. Instead of coercing non-bools to "false", it fails.
 * Useful with z.union; so strings other than "true", "false", "yes", and "no" can be
 * tried against other parsers.
 */
function zodStrictBoolean(): z.ZodEffects<z.ZodBoolean, boolean, unknown> {
	return z.preprocess((val) => {
		if (typeof val !== 'string') {
			return val;
		}
		const lval = val.toLocaleLowerCase().trim();
		if (lval === 'true' || lval === 'yes') {
			return true;
		}
		if (lval === 'false' || lval === 'no') {
			return false;
		}
		return val;
	}, z.boolean());
}
