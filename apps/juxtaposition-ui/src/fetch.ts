import { Metadata } from 'nice-grpc';
import { config } from '@/config';
import { grpcClient } from '@/grpc';

export type FetchOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	headers?: Record<string, string>;
	body?: Record<string, any> | undefined | null;
};

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
		...defaultedOptions.headers,
		'X-API-Key': config.grpc.miiverse.apiKey
	});
	const response = await grpcClient.sendPacket({
		path,
		method: defaultedOptions.method,
		payload: defaultedOptions.body ? JSON.stringify(defaultedOptions.body) : undefined
	}, {
		metadata
	});

	if (isErrorHttpStatus(response.status)) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return JSON.parse(response.payload) as T;
}
