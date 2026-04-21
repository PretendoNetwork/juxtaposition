import { writeFileSync } from 'node:fs';
import {
	OpenAPIRegistry,
	OpenApiGeneratorV31
} from '@asteasolutions/zod-to-openapi';
import type { z } from 'zod';

export const openapiRegistry = new OpenAPIRegistry();

export function generateOpenapi() {
	const generator = new OpenApiGeneratorV31(openapiRegistry.definitions);
	const doc = generator.generateDocument({
		openapi: '3.1.0',
		info: {
			title: 'miiverse-api internal API',
			description: 'This API is internal and cannot be used externally',
			version: '1.0.0'
		},
		servers: [{
			url: '{server}/api/v1',
			variables: {
				server: {
					default: 'localhost',
					description: 'Localhost instance of miiverse-api'
				}
			}
		}]
	});
	return doc;
}

// This method is only needed when schemas don't get properly parsed
// See this issue: https://github.com/asteasolutions/zod-to-openapi/issues/258
export function asOpenapi<T extends z.ZodType>(name: string, type: T): T {
	const newType = type.openapi(name);
	openapiRegistry.register(name, newType);
	return newType;
}

export function writeOpenapiToFile() {
	writeFileSync('./internal.openapi.json', JSON.stringify(generateOpenapi(), null, 2));
}
