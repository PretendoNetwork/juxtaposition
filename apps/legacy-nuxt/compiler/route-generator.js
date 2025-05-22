const path = require('node:path');
const fs = require('fs-extra');
const cheerio = require('cheerio');
const sfc = require('@vue/compiler-sfc');
const { PATHS, PAGE_SCAFFOLD } = require('./config');
const HTMLUtils = require('./html-utils');
const ScriptCompiler = require('./script-compiler');
const TemplateCompiler = require('./template-compiler');

const DEFAULT_APP_VUE = `
<template>
	<NuxtPage/>
</template>`;

// * Generates details for a single page component.
// * Parses the .vue SFC, compiles its script and
// * template, and determines its route path
function generatePageDetails(filePath) {
	console.log(`Processing page for routing: ${filePath}`);

	// * Get the Vue SFC (Single-File Component) AST
	const fileContent = fs.readFileSync(filePath, 'utf-8');
	const { descriptor } = sfc.parse(fileContent, {
		filename: filePath
	});

	// * Use AST to compile the page details.
	// * Start with the `<script>` portion because
	// * the template portion needs to know about
	// * the ref variables and their initial state/bindings
	const script = ScriptCompiler.compile(descriptor);
	const template = TemplateCompiler.compile(descriptor.template, script.refVars, script.initialStateValues);

	// * Map the `pages` folder to Express routes
	let routePath = path.relative(PATHS.pages, filePath).replace(/\.vue$/, '');

	// * Make sure files named `index.vue` do NOT map to `/index` Express routes,
	// * and instead map to their parent folder name
	if (path.basename(routePath) === 'index') {
		routePath = path.dirname(routePath) === '.' ? '' : path.dirname(routePath);
	}

	const route = '/' + routePath
		.replace(/\[([^\]]+)\]/g, ':$1') // * Convert `[param]` to `:param`
		.replace(/\\/g, '/')             // * Normalize slashes
		.replace(/\/\//g, '/');          // * Prevent double slashes

	return {
		descriptor,
		script,
		template,
		route
	};
}

// * Takes the parsed Vue page details and pre-renders
// * the HTML page
function prerenderHTML(pageDetails, appVueContent) {
	const { descriptor, script, template } = pageDetails;
	const { descriptor: appVueDescriptor } = sfc.parse(appVueContent);
	const appVue = TemplateCompiler.compile(appVueDescriptor.template);

	const $appVue = cheerio.load(appVue, null, false);
	$appVue('NuxtPage').replaceWith(template);

	let html = PAGE_SCAFFOLD;

	// * Inject data into the page
	html = html.replace('{{ title }}', HTMLUtils.escapeHTML(script.meta.title || 'App'));
	html = html.replace('{{ head }}', script.meta.headTags || '');
	html = html.replace('{{ style }}', descriptor.styles.map(style => style.content).join('\n'));

	// * Inject the template into the actual page document
	const $page = cheerio.load(html);
	$page('NuxtPage').replaceWith($appVue.html());

	html = $page.html();

	// * Inject the route params script and component
	// * script into the `{{ component_script }}` placeholder
	const routeParamsScript = 'window.route = { params: {} };';
	const componentScript = script.code;

	html = html.replace('{{ component_script }}', `${routeParamsScript}\n${componentScript}`);

	return html;
}

// * Generates the main `server.js` script content.
// * This script will contain an Express server setup to serve the compiled pages
function generateServerScript(pageFilePaths) {
	const pageRoutes = [];
	const appVue = fs.existsSync(PATHS.app) ? fs.readFileSync(PATHS.app, {
		encoding: 'utf8'
	}) : DEFAULT_APP_VUE;

	// * Turn Vue SFCs in `pages` into Express routes
	for (const filePath of pageFilePaths) {
		try {
			const pageDetails = generatePageDetails(filePath);
			const htmlContent = prerenderHTML(pageDetails, appVue);

			if (htmlContent) {
				pageRoutes.push({
					name: pageDetails.route,
					htmlContent: htmlContent
				});
				console.log(`Generated route for ${pageDetails.route}`);
			} else {
				console.warn(`Skipping route generation for ${filePath} due to assembly error.`);
			}
		} catch (error) {
			console.error(`Error processing page ${filePath}:`, error);
		}
	}

	// * Start building the `server.js` script
	const serverScript = [
		'const path = require(\'node:path\');',
		'const express = require(\'express\');',
		'',
		'const app = express();',
		'const PORT = process.env.PORT || 3000;',
		'',
		'app.use(express.static(path.join(__dirname, \'public\')));',
		'app.use(\'/runtime\', express.static(path.join(__dirname, \'runtime\')));',
	];

	// * Generate Express route handlers for each page
	pageRoutes.forEach(route => {
		const escapedHtmlContent = JSON.stringify(route.htmlContent);

		serverScript.push(...[
			'',
			`app.get('${route.name}', (req, res) => {`,
			`\tvar pageHtml = ${escapedHtmlContent};`,
			'\tpageHtml = pageHtml.replace(\'window.route = { params: {} };\', \'window.route = { params: \' + JSON.stringify(req.params) + \' };\');',
			'\tres.send(pageHtml);',
			'});'
		]);
	});

	serverScript.push(...[
		'',
		'app.listen(PORT, () => {',
		'\tconsole.log(\'Server listening on http://localhost:\' + PORT);',
		'});'
	]);

	return serverScript.join('\n');
}

module.exports = {
	generateServerScript
};