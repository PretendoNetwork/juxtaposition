/*
 * This file needs to be indivually compilable and runnable, so this does not depend on any existing project files
 */

import { createConfig, loaders, zodV4SchemaToTransformer } from '@neato/config';
import { defineConfig } from 'prisma/config';
import { z } from 'zod';
import type { SchemaTransformer, SchemaTransformerContext } from '@neato/config';

const schema = z.object({
	db: z.object({
		url: z.string()
	})
});

const dockerPreset: z.input<typeof schema> = {
	db: {
		url: 'postgresql://postgres:postgres@localhost:5432/miiverse'
	}
};

function flatZodSchema<T extends z.ZodType>(schema: T): SchemaTransformer<z.infer<T>> {
	const transformer = zodV4SchemaToTransformer<z.infer<T>>(schema);
	return {
		extract: () => transformer.extract().map(v => ({
			...v,
			normalizedKey: v.normalizedKey.replaceAll('__', '_')
		})),
		validate: (ctx: SchemaTransformerContext) => transformer.validate(ctx)
	};
}

const config = createConfig({
	envPrefix: 'PN_MIIVERSE_API_',
	presetKey: 'usePresets',
	presets: {
		docker: dockerPreset
	},
	loaders: [
		loaders.environment(),
		loaders.file('.env'),
		loaders.file('config.json')
	],
	schema: flatZodSchema(schema)
});

export default defineConfig({
	schema: 'src/models/schema.prisma',
	migrations: {
		path: 'src/models/migrations'
	},
	datasource: {
		url: config.db.url
	}
});
