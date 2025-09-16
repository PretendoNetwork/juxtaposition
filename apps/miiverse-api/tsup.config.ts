import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/server.ts'],
	sourcemap: true,
	platform: 'node',
	clean: true,
	format: ['esm'],
	target: 'esnext',
	/* for reasons that are unclear to me, `mongodb` has dynamic requires */
	banner(ctx) {
		if (ctx.format === 'esm') {
			return {
				js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
			};
		}
	}
});
