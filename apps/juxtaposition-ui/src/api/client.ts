import { Metadata } from 'nice-grpc';
import { InternalApi } from '@/api/generated';
import { createClient } from '@/api/generated/client';
import { config } from '@/config';
import { grpcClient } from '@/grpc';
import { InternalApiError } from '@/api/errors';
import type { UserTokens } from '@/types/juxt/tokens';

export const customFetch: typeof globalThis.fetch = async (input, init) => {
	const req = new Request(input, init);
	const url = new URL(req.url);
	const metadata = Metadata({
		'X-API-Key': config.grpc.miiverse.apiKey
	});
	const method = req.method.toUpperCase();
	const grpcResponse = await grpcClient.sendPacket({
		path: url.pathname + url.search,
		method,
		headers: JSON.stringify(Object.fromEntries(req.headers.entries())),
		payload: req.body ? await new Response(req.body).text() : undefined
	}, {
		metadata
	});

	// Mask 404's as a succesfull `null` response
	const notSuccessResponse = grpcResponse.status >= 400;
	if (notSuccessResponse && req.method === 'GET') {
		try {
			const parsed = JSON.parse(grpcResponse.payload);
			const error = new InternalApiError(grpcResponse.status, parsed);
			if (error.isCode('not_found')) {
				grpcResponse.status = 200;
				grpcResponse.payload = JSON.stringify(null);
			}
		} catch {
			// Ignore errors
		}
	}

	const response = new Response(Buffer.from(grpcResponse.payload), {
		status: grpcResponse.status,
		headers: {
			'content-type': 'application/json'
		}
	});
	return response;
};

export function createInternalApiClient(tokens: UserTokens): InternalApi {
	const client = createClient({
		fetch: customFetch,
		baseUrl: 'https://example.com/api/v1', // Hostname is ignored by `customFetch`
		headers: {
			'x-service-token': tokens.serviceToken,
			'x-oauth-token': tokens.oauthToken
		},
		throwOnError: true
	});

	client.interceptors.error.use((err, response, _req, options) => {
		if (!options.throwOnError) {
			return err;
		}

		return new InternalApiError(response.status, err);
	});

	return new InternalApi({
		client
	});
}
