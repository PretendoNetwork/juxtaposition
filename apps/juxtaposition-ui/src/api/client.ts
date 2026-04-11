import { Metadata } from 'nice-grpc';
import { InternalApi } from '@/api/generated';
import { createClient } from '@/api/generated/client';
import { config } from '@/config';
import { grpcClient } from '@/grpc';
import type { UserTokens } from '@/types/juxt/tokens';

export const customFetch: typeof globalThis.fetch = async (input, init) => {
	const req = new Request(input, init);
	const url = new URL(req.url);
	const metadata = Metadata({
		'X-API-Key': config.grpc.miiverse.apiKey
	});
	const grpcResponse = await grpcClient.sendPacket({
		path: url.pathname + url.search,
		method: req.method.toUpperCase(),
		headers: JSON.stringify(req.headers),
		payload: req.body ? await new Response(req.body).text() : undefined
	}, {
		metadata
	});
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
		baseUrl: 'https://example.com', // Ignored by `customFetch`
		headers: {
			'x-service-token': tokens.serviceToken,
			'x-oauth-token': tokens.oauthToken
		}
	});
	return new InternalApi({
		client
	});
}
