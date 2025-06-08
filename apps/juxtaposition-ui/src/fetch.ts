import { Metadata } from 'nice-grpc';
import { config } from '@/config';
import { grpcClient } from '@/grpc';
import type { PacketResponse } from '@repo/grpc-client/out/packet';

export type FetchOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	headers?: Record<string, string | undefined>;
	body?: Record<string, any> | undefined | null;
};

export interface FetchError extends Error {
	name: 'FetchError';
	status: number;
	response: any;
}
function FetchError(response: PacketResponse, message: string): FetchError {
	const error = new Error(message) as FetchError;
	error.name = 'FetchError';
	error.status = response.status;
	error.response = response.payload; // parse json?
	return error;
}

function isErrorHttpStatus(status: number): boolean {
	return status >= 400 && status < 600;
}

export async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
	const defaultedOptions = {
		method: 'GET',
		headers: {},
		...options
	};

	const metadata = Metadata({
		'X-API-Key': config.grpc.miiverse.apiKey
	});
	const response = await grpcClient.sendPacket({
		path,
		method: defaultedOptions.method,
		headers: JSON.stringify(defaultedOptions.headers),
		payload: defaultedOptions.body ? JSON.stringify(defaultedOptions.body) : undefined
	}, {
		metadata
	});

	if (isErrorHttpStatus(response.status)) {
		throw FetchError(response, `HTTP error! status: ${response.status} ${response.payload}`);
	}

	return JSON.parse(response.payload) as T;
}

export type UserTokens = {
	serviceToken?: string;
	oauthToken?: string;
};

export async function apiFetchUser<T>(tokens: UserTokens, path: string, options?: FetchOptions): Promise<T> {
	options = {
		...options,
		headers: {
			'x-service-token': tokens.serviceToken,
			'x-oauth-token': tokens.oauthToken,
			...options?.headers
		}
	};
	return apiFetch<T>(path, options);
}
