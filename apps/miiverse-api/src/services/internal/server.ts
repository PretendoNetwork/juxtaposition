import { createServer, ServerError, Status } from 'nice-grpc';
import superRequest from 'supertest';
import express from 'express';
import { MiiverseServiceDefinition } from '@repo/grpc-client/out/miiverse_service';
import { config } from '@/config';
import { internalApiRouter } from '@/services/internal';
import { logger } from '@/logger';
import type { CallContext, ServerMiddlewareCall } from 'nice-grpc';

export async function* apiKeyMiddleware<Request, Response>(
	call: ServerMiddlewareCall<Request, Response>,
	context: CallContext
): AsyncGenerator<Response, Response | void, undefined> {
	const apiKey = context.metadata.get('X-API-Key');

	if (!apiKey || apiKey !== config.grpc.server.apiKey) {
		throw new ServerError(Status.UNAUTHENTICATED, 'Missing or invalid API key');
	}

	return yield* call.next(call.request, context);
}

const app = express();
app.use(express.json());
app.use(internalApiRouter);

const allowedMethods = ['get', 'post', 'put', 'delete', 'patch'] as const;
const methodsWithBody = ['post', 'put', 'delete', 'patch'] as const;
type AllowedMethods = typeof allowedMethods[number];

export async function setupGrpc(): Promise<void> {
	const server = createServer();

	server.with(apiKeyMiddleware).add(MiiverseServiceDefinition, {
		sendPacket: async (request) => {
			if (!allowedMethods.includes(request.method.toLowerCase() as AllowedMethods)) {
				throw new ServerError(Status.UNIMPLEMENTED, 'Method not implemented');
			}
			const method = request.method.toLowerCase() as AllowedMethods;
			const headers = JSON.parse(request.headers);
			const hasBody = methodsWithBody.includes(method as any);

			let baseRequest = superRequest(app)[method](request.path).set(headers);
			if (hasBody) {
				baseRequest = baseRequest.send(JSON.parse(request.payload));
			}

			const result = await baseRequest;
			return {
				status: result.status,
				payload: JSON.stringify(result.body)
			};
		},
		sMMRequestPostId: async (_request) => {
			throw new ServerError(Status.UNIMPLEMENTED, 'Not implemented');
		}
	});

	await server.listen(`0.0.0.0:${config.grpc.server.port}`);
	logger.info(`GRPC started started on port ${config.grpc.server.port}`);
}
