const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// * Recursively converts an AST node from a
// * `definePageMeta` object into its JavaScript value
function astNodeToValue(node) {
	if (!node) {
		return undefined;
	}

	switch (node.type) {
		case 'NullLiteral':
			return null;
		case 'StringLiteral':
		case 'NumericLiteral':
		case 'BooleanLiteral':
			return node.value;
		case 'ObjectExpression':
			const obj = {};
			for (const prop of node.properties) {
				if (prop.type === 'ObjectProperty') {
					if (prop.key.type === 'Identifier') {
						obj[prop.key.name] = astNodeToValue(prop.value);
					}

					if (prop.key.type === 'StringLiteral') {
						obj[prop.key.value] = astNodeToValue(prop.value);
					}
				}

			}
			return obj;
		case 'ArrayExpression':
			return node.elements.map(element => astNodeToValue(element));
		default:
			// TODO - There are more types that definePageMeta takes in https://nuxt.com/docs/api/utils/define-page-meta#type
			console.warn(`[MetaParser] Unsupported node type in meta object: ${node.type}. Value will be undefined.`);
			return undefined;
	}
}

// * Extracts config values passed to `definePageMeta` in Nuxt
function parse(scriptContent) {
	if (!scriptContent || scriptContent.trim() === '') {
		return {};
	}

	let ast;
	try {
		ast = parser.parse(scriptContent, {
			sourceType: 'module'
		});
	} catch (error) {
		// * If script itself is broken, we probably can't find meta anyway
		console.warn('[MetaParser] Failed to parse script content for meta:', error.message);
		return {};
	}

	let pageMeta = {};
	traverse(ast, {
		CallExpression(path) {
			if (path.node.callee.type === 'Identifier' && path.node.callee.name === 'definePageMeta') {
				if (path.node.arguments.length > 0 && path.node.arguments[0].type === 'ObjectExpression') {
					pageMeta = astNodeToValue(path.node.arguments[0]);
					// * Stop traversal once the first `definePageMeta` call is processed.
					// * This assumes there's only one `definePageMeta` call per script
					path.stop();
				} else {
					console.warn('[MetaParser] definePageMeta found but argument is not an ObjectExpression.');
				}
			}
		}
	});

	// TODO - Validate the object and reject any invalid keys?

	return pageMeta || {}; // * Just in case `astNodeToValue` ever returns null/undefined
}

module.exports = {
	parse
};