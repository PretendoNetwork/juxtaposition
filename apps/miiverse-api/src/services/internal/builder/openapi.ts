import { writeFileSync } from 'node:fs';
import {
	OpenAPIRegistry,
	OpenApiGeneratorV3
} from '@asteasolutions/zod-to-openapi';

export const openapiRegistry = new OpenAPIRegistry();

export function generateOpenapi() {
	const generator = new OpenApiGeneratorV3(openapiRegistry.definitions);
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

export function writeOpenapiToFile() {
	writeFileSync('./internal.openapi.json', JSON.stringify(generateOpenapi(), null, 2));
}
