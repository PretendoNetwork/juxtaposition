const path = require('node:path');
const fs = require('fs-extra');

const { PATHS: CONFIG } = require('./compiler/config');
const RouteGenerator = require('./compiler/route-generator');

// * Recursively walks a directory to find files
// * matching a given path name filter
function walk(dir, filter, found = []) {
	if (!fs.pathExistsSync(dir)) {
		return found;
	}

	const entries = fs.readdirSync(dir, {
		withFileTypes: true
	});

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath, filter, found);
		} else if (filter(entry.name)) {
			found.push(fullPath);
		}
	}

	return found;
}

function getVuePagesFiles(dir) {
	return walk(dir, name => name.endsWith('.vue'));
}

// * Unused right now
function readApiRoutes(dir) {
	return walk(dir, name => name.match(/\.(get|post|put|delete|patch)\.ts$/));
}

function build() {
	console.log('Starting build...');

	// * Reset the `dist` directory before building
	fs.emptyDirSync(CONFIG.dist);
	console.log('Cleaned dist directory.');

	if (fs.pathExistsSync(CONFIG.public)) {
		fs.copySync(CONFIG.public, path.join(CONFIG.dist, 'public'));
		console.log('Copied public assets.');
	}

	// * `reactivity.js` is the client-side state management
	// * library for managing reactive interactions
	const reactivitySrc = path.join(CONFIG.runtime, 'reactivity.js');
	const reactivityDestDir = path.join(CONFIG.dist, 'runtime');
	const reactivityDest = path.join(reactivityDestDir, 'reactivity.js');

	if (fs.pathExistsSync(reactivitySrc)) {
		fs.ensureDirSync(reactivityDestDir);
		fs.copySync(reactivitySrc, reactivityDest);
		console.log('Copied runtime/reactivity.js.');
	} else {
		console.warn('runtime/reactivity.js not found, skipping copy.');
	}

	const pageFiles = getVuePagesFiles(CONFIG.pages);
	console.log(`Found ${pageFiles.length} page component(s).`);

	// * Generate the main server script.
	// * This compiles all the Vue page components into
	// * pre-rendered html to avoid SSR on every request
	// * and avoid expensive client-side rendering.
	// * Builds an Express application with all the Vue
	// * `pages` as routes
	const serverScript = RouteGenerator.generateServerScript(pageFiles);

	if (serverScript) {
		fs.writeFileSync(path.join(CONFIG.dist, 'server.js'), serverScript);
		console.log('Generated dist/server.js');
		console.log('Build complete! Output in dist/');
		console.log('You can now run: node dist/server.js');
	} else {
		console.error('Failed to generate server script. Build incomplete.');
		process.exit(1);
	}
}

try {
	build();
} catch (error) {
	console.error('Failed to build project:', error);
}