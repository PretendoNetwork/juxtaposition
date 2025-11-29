import { createServer, ServerError, Status } from 'nice-grpc';
import superRequest from 'supertest';
import express from 'express';
import { MiiverseInternalServiceDefinition } from '@repo/grpc-client/out/miiverse_service';
import { MiiverseServiceDefinition } from '@pretendonetwork/grpc/miiverse/v2/miiverse_service';
import { config } from '@/config';
import { internalApiRouter } from '@/services/internal';
import { logger } from '@/logger';
import { InternalAPIError } from '@/services/internal/errors';
import { loggerHttp } from '@/loggerHttp';
import { authPopulate } from '@/services/internal/middleware/auth-populate';
import { authAccessCheck } from '@/services/internal/middleware/auth-accesscheck';
import { miiverseDefinition } from '@/services/grpc/server';
import type { CallContext, ServerMiddlewareCall } from 'nice-grpc';

// API server

const app = express();
app.use(express.json());
app.use(loggerHttp);
app.use(authPopulate);
app.use(authAccessCheck);
app.use(internalApiRouter);

// API error handler
app.use((err: Error, _request: express.Request, response: express.Response, next: express.NextFunction) => {
	if (!(err instanceof InternalAPIError)) {
		return next(err);
	}

	response.status(err.status).json({ message: err.message });
});
// Javascript error handler
app.use((err: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
	response.err = err; // For Pino
	response.status(500).json({ message: 'Internal server error' });
});

// gRPC glue

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

const allowedMethods = ['get', 'post', 'put', 'delete', 'patch'] as const;
const methodsWithBody = ['post', 'put', 'patch'] as const;
type AllowedMethods = typeof allowedMethods[number];

export async function setupGrpc(): Promise<void> {
	const server = createServer();

	// Internal communication (juxtaposition-ui --> miiverse-api)
	server.with(apiKeyMiddleware).add(MiiverseInternalServiceDefinition, {
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
		}
	});

	// External communication (other pretendo services --> miiverse-api)
	server.with(apiKeyMiddleware).add(MiiverseServiceDefinition, miiverseDefinition);

	await server.listen(`0.0.0.0:${config.grpc.server.port}`);
	logger.info(`GRPC started started on port ${config.grpc.server.port}`);
}
