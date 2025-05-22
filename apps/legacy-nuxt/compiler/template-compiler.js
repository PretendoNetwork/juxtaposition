const cheerio = require('cheerio');
const { transform, NodeTypes, createSimpleExpression } = require('@vue/compiler-dom');
const HTMLUtils = require('./html-utils');

// * Transforms a JavaScript expression string into a form
// * the runtime can easily parse
function generateDataHandlerValue(expression, refVars=[]) {
	expression = String(expression).trim();

	// * Check for simple operations. For example `count++` becomes `increment:count`
	for (const refVar of refVars) {
		if (expression === `${refVar}++`) {
			return `increment:${refVar}`;
		}

		if (expression === `${refVar}--`) {
			return `decrement:${refVar}`;
		}
	}

	// * Transforms function calls into a value the runtime
	// * can handle. For example `setTheme("blue")` becomes
	// * `call:setTheme:'blue'`
	// TODO - Maybe "args" should be a JSON object? To support complex calls?
	const functionCallMatch = expression.match(/^(\w+)\((.*)\)$/);
	if (functionCallMatch) {
		let args = functionCallMatch[2].trim();

		// * Escape quotes if need be
		if ((args.startsWith('\'') && args.endsWith('\'')) && (args.startsWith('"') && args.endsWith('"'))) {
			// * Otherwise, escape quotes within the arguments for safe HTML attribute embedding.
			// * This prevents issues if arguments themselves contain quotes.
			args = args.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
		}

		return `call:${functionCallMatch[1]}:${args}`;
	}

	// * Transforms ref assignments into a value the runtime
	// * can handle. For example `theme='blue'` becomes
	// * `assign:theme:'blue'`
	const assignMatch = expression.match(/^([\w\.]+)\s*=\s*(.+)$/);
	if (assignMatch) {
		let value = assignMatch[2].trim();

		// * Escape quotes if need be
		if ((value.startsWith('\'') && value.endsWith('\'')) && (value.startsWith('"') && value.endsWith('"'))) {
			value = value.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
		}

		return `assign:${assignMatch[1]}:${value}`;
	}

	// * If all else fails, return the expression escaped
	return expression.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// * Serializes a Vue AST to HTML
function renderASTToHTML(node, initialState={}) {
	if (!node) {
		return '';
	}

	switch (node.type) {
		case NodeTypes.ROOT:
			return node.children.map(child => renderASTToHTML(child, initialState)).join('');
		case NodeTypes.ELEMENT:
			let html = `<${node.tag}`;

			if (node.props) {
				for (const prop of node.props) {
					if (prop.type === NodeTypes.ATTRIBUTE) {
						const valueContent = prop.value ? HTMLUtils.escapeHTML(prop.value.content) : '';
						html += ` ${prop.name}="${valueContent}"`;
					}
				}
			}

			if (node.isSelfClosing && !node.children.length) {
				html += ' />';
			} else {
				html += '>';

				if (node.children) {
					html += node.children.map(child => renderASTToHTML(child, initialState)).join('');
				}

				html += `</${node.tag}>`;
			}

			return html;
		case NodeTypes.TEXT:
			return HTMLUtils.escapeHTML(node.content);
		case NodeTypes.COMMENT:
			return `<!--${HTMLUtils.escapeHTML(node.content)}-->`;
		case NodeTypes.INTERPOLATION:
			// * Render "interpolation" nodes like `{{ refName }}` into
			// * `<span data-bind="refName">{{ refName }}</span>` and
			// * give it the refs initial value
			if (node.content && node.content.type === NodeTypes.SIMPLE_EXPRESSION) {
				const refName = node.content.content.trim();
				const initialValue = initialState.hasOwnProperty(refName) ? initialState[refName] : '';

				return HTMLUtils.escapeHTML(String(initialValue));
			}

			return '';
		default:
			// TODO - Are there others to support?
			return '';
	}
}

// * Transform the Vue AST and render the template HTML
function compile(templateDescriptor, refVars=[], initialStateValues={}) {
	if (!templateDescriptor || !templateDescriptor.ast) {
		return {
			innerHTML: '',
			isAppWrapper: false,
			attributes: {}
		};
	}

	// * Deep clone the AST so that changes are local
	const ast = JSON.parse(JSON.stringify(templateDescriptor.ast));

	// * Transform some nodes. Vue has custom syntax that needs
	// * to be adapter into normal HTML
	transform(ast, {
		nodeTransforms: [
			(node) => {
				if (node.type === NodeTypes.ELEMENT) {
					// * Node is a template element, transform it's props
					const newProps = [];

					for (const prop of node.props) {
						// * `v-model`, `:class`, `@click`, etc.
						if (prop.type === NodeTypes.DIRECTIVE) {
							if (prop.name === 'model' && prop.exp) {
								// * Transform `v-model="refName"` to `data-model="refName"`
								newProps.push({
									type: NodeTypes.ATTRIBUTE,
									name: 'data-model',
									value: {
										type: NodeTypes.TEXT,
										content: prop.exp.content.trim(),
										loc: prop.exp.loc
									},
									loc: prop.loc
								});

								continue;
							} else if (prop.name === 'bind' && prop.arg && prop.arg.type === NodeTypes.SIMPLE_EXPRESSION && prop.arg.content === 'class' && prop.exp) {
								// * Transform `:class="refName"` to `data-class-binding="refName"`
								newProps.push({
									type: NodeTypes.ATTRIBUTE,
									name: 'data-class-binding',
									value: {
										type: NodeTypes.TEXT,
										content: prop.exp.content.trim(),
										loc: prop.exp.loc
									},
									loc: prop.loc
								});

								const originalClassesProp = node.props.find(({ name }) => name === 'class');
								if (originalClassesProp) {
									newProps.push({
										type: NodeTypes.ATTRIBUTE,
										name: 'data-original-class',
										value: {
											type: NodeTypes.TEXT,
											content: originalClassesProp.value.content,
											loc: prop.exp.loc
										},
										loc: prop.loc
									});
								}

								continue;
							} else if (prop.name === 'on' && prop.arg && prop.arg.type === NodeTypes.SIMPLE_EXPRESSION && prop.exp) {
								// * Transform `@event="handler"` to `data-on="event" data-handler="parsedHandler"`
								const eventName = prop.arg.content;
								const handlerValue = generateDataHandlerValue(prop.exp.content, refVars);

								newProps.push({
									type: NodeTypes.ATTRIBUTE,
									name: 'data-on',
									value: {
										type: NodeTypes.TEXT,
										content: eventName,
										loc: prop.arg.loc
									},
									loc: prop.loc
								});

								newProps.push({
									type: NodeTypes.ATTRIBUTE,
									name: 'data-handler',
									value: {
										type: NodeTypes.TEXT,
										content: handlerValue,
										loc: prop.exp.loc
									},
									loc: prop.loc
								});

								continue;
							}
						}

						// * Keep other props (non-transformed directives or regular attributes) as they are.
						newProps.push(prop);
					}
					// * Replace the node's properties with the new, transformed properties.
					node.props = newProps;

				} else if (node.type === NodeTypes.INTERPOLATION) {
					// * Node is an "interpolation" (one-way binding, `{{ refName }}`).
					// * Turn it into `<span>` element

					if (node.content && node.content.type === NodeTypes.SIMPLE_EXPRESSION) {
						const content = node.content.content.trim();
						// * Return a function to modify the node in place.
						// * This transforms an interpolation like `{{ refName }}` into
						// * `<span data-bind="refName">{{ refName }}</span>`.
						// * The inner `{{ refName }}` (re-created as a child INTERPOLATION node)
						// * is kept specifically for SSR.
						// * The `renderASTToHTML` function will use this inner interpolation
						// * and `initialStateValues` to render the initial value directly in the HTML
						return () => {
							// * Transform into a `<span>` ELEMENT node
							node.type = NodeTypes.ELEMENT;
							node.ns = 0; // * HTML namespace
							node.tag = 'span';
							node.tagType = 0;
							node.props = [{
								type: NodeTypes.ATTRIBUTE,
								name: 'data-bind',
								value: { type: NodeTypes.TEXT, content: content, loc: node.content.loc },
								loc: node.loc
							}];

							// * Keep the original interpolation as a child for SSR purposes
							node.children = [{
								type: NodeTypes.INTERPOLATION,
								content: createSimpleExpression(content, false, node.content.loc),
								loc: node.loc
							}];
							node.isSelfClosing = false;
							delete node.content; // * Remove original content property as it's now in `children`
						};
					}
				}
			}
		]
	});

	// * We've transformed the AST in ways that Vue's serializer can't
	// * cope with, so implement it ourselves
	return renderASTToHTML(ast, initialStateValues);
}

module.exports = {
	compile
};