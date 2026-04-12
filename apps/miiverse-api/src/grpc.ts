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
};

function grpcFactory<T extends CompatServiceDefinition>(definition: T): GrpcConnection<T> {
	let client: Client<T> | null = null;
	let connected = false;

	return {
		connect(ops) {
			if (connected) {
				throw new Error('Already connected');
			}
			const channel = createChannel(`${ops.host}:${ops.port}`);
			client = createClient(definition, channel, {
				'*': {
					metadata: Metadata({
						'X-API-Key': ops.apiKey
					})
				}
			});
			connected = true;
		},
		client() {
			if (!client) {
				throw new Error('Client has not been connected yet');
			}
			return client;
		}
	};
}

export function connectGrpc() {
	grpcFriends.connect(config.grpc.friends);
	grpcAccount.connect(config.grpc.account);
	grpcApi.connect(config.grpc.account);
}
