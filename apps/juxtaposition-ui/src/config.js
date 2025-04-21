const { createConfigLoader } = require('@neato/config');
const { z } = require('zod');

// schema is mapped later to nested object to keep env vars consistent with other projects
const schema = z.object({
	logFolder: z.string().default(`${__dirname}/../logs`),
	httpPort: z.coerce.number().default(8080),
	httpCookieDomain: z.string().default('.pretendo.network'),
	postLimit: z.coerce.number().default(10),
	miiImageCdn: z.string(),
	cdnDomain: z.string(),
	whitelist: z.string(),
	serverEnvironment: z.string(),
	aesKey: z.string(),
	accountServerAddress: z.string(),
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
	redisHost: z.string(),
	redisPort: z.coerce.number().default(6379)
});

module.exports.fragments = {
	docker: {
		httpCors: 'http://localhost:3000 http://localhost:5173',
		httpFrontendBaseUrl: 'http://localhost:5173/',
		httpBackendBaseUrl: 'http://localhost:8080/',
		aesKey: '123456',
		mongooseUri: 'mongodb://localhost:27017/miiverse?directConnection=true',
		s3Endpoint: 'http://localstack:4567',
		s3Key: 'xyz',
		s3Secret: 'xyz',
		s3Bucket: 'juxt',
		s3Region: 'us-east-1',
		redisHost: 'localhost'
	}
};

const unmappedConfig = createConfigLoader()
	.addFromEnvironment('PN_JUXTAPOSITION_UI_')
	.addFromFile('.env', { prefix: 'PN_JUXTAPOSITION_UI_' })
	.addFromFile('config.json')
	.addZodSchema(schema)
	.addConfigFragments(module.exports.fragments)
	.setFragmentKey('USE_PRESETS')
	.load();

module.exports.config = {
	logFolder: unmappedConfig.logFolder,
	http: {
		port: unmappedConfig.httpPort,
		cookieDomain: unmappedConfig.httpCookieDomain
	},
	accountServerAddress: unmappedConfig.accountServerAddress,
	aesKey: unmappedConfig.aesKey,
	postLimit: unmappedConfig.postLimit,
	miiImageCdn: unmappedConfig.miiImageCdn,
	whitelist: unmappedConfig.whitelist,
	serverEnvironment: unmappedConfig.serverEnvironment,
	cdnDomain: unmappedConfig.cdnDomain,
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
	},
	redis: {
		host: unmappedConfig.redisHost,
		port: unmappedConfig.redisPort
	}
};
