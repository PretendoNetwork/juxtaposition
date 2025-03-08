import type mongoose from 'mongoose';

export interface Config {
	http: {
		port: number;
	};
	account_server_address: string;
	mongoose: {
		connection_string: string;
		options: mongoose.ConnectOptions;
	};
	cdn_url: string;
	s3: {
		endpoint: string;
		key: string;
		secret: string;
		bucket: string;
		region: string;
	};
	grpc: {
		friends: {
			ip: string;
			port: number;
			api_key: string;
		};
		account: {
			ip: string;
			port: number;
			api_key: string;
		};
	};
	aes_key: string;
}
