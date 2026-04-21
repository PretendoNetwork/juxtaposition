import { createChannel, createClient, Metadata } from 'nice-grpc';
import { FriendsDefinition } from '@pretendonetwork/grpc/friends/friends_service';
import { AccountDefinition } from '@pretendonetwork/grpc/account/account_service';
import { APIDefinition } from '@pretendonetwork/grpc/api/api_service';
import { config } from '@/config';
import type { Client, CompatServiceDefinition } from 'nice-grpc';

export const grpcFriends = grpcFactory(FriendsDefinition);
export const grpcAccount = grpcFactory(AccountDefinition);
export const grpcApi = grpcFactory(APIDefinition);

type GrpcConnection<T extends CompatServiceDefinition> = {
	client(): Client<T>;
	connect(ops: { host: string; port: string | number; apiKey: string }): void;
	createHeaders(headersInit?: Record<string, string>): Metadata;
};

function grpcFactory<T extends CompatServiceDefinition>(definition: T): GrpcConnection<T> {
	let client: Client<T> | null = null;
	let connected = false;
	let apiKey: string | null = null;

	function createHeaders(headersInit?: Record<string, string>): Metadata {
		const headers = new Metadata(headersInit);
		if (apiKey) {
			headers.append('X-API-Key', apiKey);
		}
		return headers;
	}

	return {
		connect(ops) {
			if (connected) {
				throw new Error('Already connected');
			}
			apiKey = ops.apiKey;
			const channel = createChannel(`${ops.host}:${ops.port}`);
			client = createClient(definition, channel, {
				'*': {
					metadata: createHeaders()
				}
			});
			connected = true;
		},
		client() {
			if (!client) {
				throw new Error('Client has not been connected yet');
			}
			return client;
		},
		createHeaders
	};
}

export function connectGrpc() {
	grpcFriends.connect(config.grpc.friends);
	grpcAccount.connect(config.grpc.account);
	grpcApi.connect(config.grpc.account);
}
