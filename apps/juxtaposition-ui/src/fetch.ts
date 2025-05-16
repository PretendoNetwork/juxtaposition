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
		throw new Error(`HTTP error! status: ${response.status} ${response.payload}`);
	}

	return JSON.parse(response.payload) as T;
}

export async function apiFetchUser<T>(request: any, path: string, options?: FetchOptions): Promise<T> {
	options = {
		...options,
		headers: {
			'x-service-token': request.serviceToken,
			'x-oauth-token': request.token,
			...options?.headers
		}
	};
	return apiFetch<T>(path, options);
}
