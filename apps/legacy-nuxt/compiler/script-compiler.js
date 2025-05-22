const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');
const MetaParser = require('./meta-parser');

// * Create an AST node for `window.g_state['refName']`
function createGStateRead(refName) {
	return t.memberExpression(t.memberExpression(t.identifier('window'), t.identifier('g_state')), t.stringLiteral(refName), true);
}

// * Create an AST node for `window.updateUI();`
function createUpdateUICall() {
	return t.callExpression(t.memberExpression(t.identifier('window'), t.identifier('updateUI')), []);
}

// * Transforms `.value` accesses on refs.
// * For example, statements like `counter.value` become `window.g_state["counter"]` and
// * `counter.value = 10` become `window.g_state["counter"] = 10; window.updateUI();`
function scriptValueTransformer(refVars) {
	return {
		MemberExpression(path) {
			if (
				path.node.object.type === 'Identifier' &&
				refVars.includes(path.node.object.name) &&
				path.node.property.type === 'Identifier' &&
				path.node.property.name === 'value'
			) {

				// * Checks if the access is on the left (update)
				// * or on the right (read)
				if (path.parentPath.isAssignmentExpression() && path.key === 'left') {
					// * Access is an update (`counter.value = 10`)
					const assignmentPath = path.parentPath;
					const rightHandSide = assignmentPath.node.right;

					// * If the assignment is a standalone expression statement (`counter.value = 10`)
					if (assignmentPath.parentPath.isExpressionStatement()) {
						// * Create the AST for `window.g_state['refName'] (operator) rightHandSide;`
						const correctAssignmentStatement = t.expressionStatement(
							t.assignmentExpression(
								assignmentPath.node.operator,
								createGStateRead(path.node.object.name),
								rightHandSide
							)
						);

						// * Create the AST for `window.updateUI();`
						const updateCall = t.expressionStatement(createUpdateUICall());

						// * Since this is a standalone expression, simple BlockStatement replacement
						assignmentPath.parentPath.replaceWith(t.blockStatement([correctAssignmentStatement, updateCall]));
					} else {
						// * If the assignment is part of a more complex expression such as `var x = (count.value = 1);`,
						// * it cannot be replaced using a simple replacement. Instead, it's wrapped in a
						// * SequenceExpression `( (assignment_to_g_state), window.updateUI() )`
						assignmentPath.replaceWith(t.sequenceExpression([
							t.assignmentExpression(assignmentPath.node.operator, createGStateRead(path.node.object.name), rightHandSide),
							createUpdateUICall()
						]));
					}
				} else {
					// * Access is a read (`console.log(counter.value)`)
					path.replaceWith(createGStateRead(path.node.object.name));
				}
			}
		}
	}
};

// * Does the actual script processing. Extracts the Vue refs
// * and other logic, and transforms it into something the 3DS/Wii U
// * can use with our custom runtime
function compileBase(scriptContent) {
	if (!scriptContent || scriptContent.trim() === '') {
		return {
			code: '',
			meta: MetaParser.parse(''),
			refVars: [],
			initialStateValues: {}
		};
	}

	let ast;
	try {
		ast = parser.parse(scriptContent, {
			sourceType: 'module'
		});
	} catch (error) {
		console.error('Failed to parse script content:', error);
		return {
			code: '',
			meta: MetaParser.parse(''),
			refVars: [],
			initialStateValues: {}
		};
	}

	const refVars = [];
	const refValues = [];
	const functions = [];
	let remainingScriptNodes = [];

	traverse(ast, {
		VariableDeclaration(path) {
			// * 3DS doesn't support const/let variables
			if (path.node.kind === 'const' || path.node.kind === 'let') {
				path.node.kind = 'var';
			}

			path.node.declarations.forEach(declaration => {
				if (
					declaration.id.type === 'Identifier' &&
					declaration.init &&
					declaration.init.type === 'CallExpression' &&
					declaration.init.callee.type === 'Identifier' &&
					declaration.init.callee.name === 'ref'
				) {
					const refName = declaration.id.name;
					const rawValueNode = declaration.init.arguments.length > 0 ? declaration.init.arguments[0] : t.stringLiteral('');
					const rawValueString = generator(rawValueNode).code;

					refVars.push(refName);
					refValues.push({
						name: refName,
						rawValueString
					});

					// * Remove the original ref declaration, it will be handled by `g_state`
					path.remove();
				}
			});
		},
		FunctionDeclaration(path) {
			const funcName = path.node.id.name;
			const params = path.node.params.map(p => generator(p).code);

			path.get('body').traverse(scriptValueTransformer(refVars));
			const bodyContent = generator(path.node.body).code;

			functions.push({
				name: funcName,
				params,
				body: generator(path.node.body).code.substring(1, bodyContent.length -1).trim() // * Remove {} and trim
			});

			path.remove(); // * Remove from AST, will be added to window
		},
		VariableDeclarator(path) {
			// * For arrow functions declared as variables
			if (
				path.node.id.type === 'Identifier' &&
				path.node.init &&
				(path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression')
			) {
				const funcName = path.node.id.name;
				const params = path.node.init.params.map(p => generator(p).code);

				path.get('init.body').traverse(scriptValueTransformer(refVars));

				const bodyBlockOrExpr = path.node.init.body;
				const bodyCode = generator(bodyBlockOrExpr).code;
				const finalBody = bodyBlockOrExpr.type === 'BlockStatement' ? bodyCode.substring(1, bodyCode.length-1).trim() : `return ${bodyCode};`; // * For functions that return an expression

				functions.push({
					name: funcName,
					params,
					body: finalBody
				});

				// * If parent is VariableDeclaration, remove the whole declaration if this is the only declarator
				if (path.parentPath.isVariableDeclaration() && path.parentPath.node.declarations.length === 1) {
					path.parentPath.remove();
				} else {
					path.remove();
				}
			}
		},
		ImportDeclaration(path) {
			path.remove(); // * Remove all imports, we aren't in ES6
		},
		ExportDefaultDeclaration(path) {
			path.remove(); // * Remove export default, we aren't in ES6
		},
		ExportNamedDeclaration(path) {
			path.remove(); // * Remove named exports, we aren't in ES6
		},
		Program: {
			// * Using `exit` ensures this code runs as the very last processer.
			// * This is important for collecting all remaining statements
			// * that weren't explicitly handled. This is all the remaining
			// * logic of the script tag, which needs to be carried over
			exit(path) {
				path.node.body.forEach(node => {
					traverse(node, scriptValueTransformer(refVars), path.scope, path);
					remainingScriptNodes.push(node);
				});
			}
		}
	});

	const remainingScriptCode = remainingScriptNodes.map(node => generator(node).code).join('\n');

	// * Construct client script as an IIFE to create a local scope
	// * and avoid polluting the global namespace, beyond what is
	// * intentionally exposed on `window` (`g_state`, methods, etc.)
	const clientScript = [
		'(function() {'
	];

	for (const ref of refValues) {
		clientScript.push(...[
			`\twindow.g_state['${ref.name}'] = ${ref.rawValueString || 'undefined'};`,
			''
		]);
	}

	for (const func of functions) {
		clientScript.push(...[
			`\twindow.${func.name} = function(${func.params.join(', ')}) {`,
			`\t\t${func.body}`,
			'\t};',
			''
		]);
	}

	clientScript.push(...[
		`\t${remainingScriptCode}`,
		'})();'
	]);

	// * Get the initial values for ref states
	const initialStateValues = refValues.reduce((acc, ref) => {
		const value = ref.rawValueString;

		if ((value.startsWith("'") && value.endsWith("'")) || value.startsWith('"') && value.endsWith('"')) {
			acc[ref.name] = value.substring(1, value.length -1);
		} else if (value === 'true') {
			acc[ref.name] = true;
		} else if (value === 'false') {
			acc[ref.name] = false;
		} else if (!isNaN(parseFloat(value)) && isFinite(value)) {
			acc[ref.name] = parseFloat(value);
		} else {
			acc[ref.name] = value;
		}

		return acc;
	}, {});

	return {
		code: clientScript.join('\n'),
		meta: MetaParser.parse(scriptContent), // * MetaParser still uses original scriptContent
		refVars: refVars,
		initialStateValues: initialStateValues
	};
}

// * Processes the SFC script tag. Only 1 script
// * supported right now
function compile(descriptor) {
	// * `<script setup>` and `<script>` are different,
	// * so the AST tracks them separately. Right now
	// * we just treat them the same though
	// TODO - Actually handle these correctly
	//        https://vuejs.org/api/sfc-spec.html#script
	//        https://vuejs.org/api/sfc-script-setup.html
	if (descriptor.scriptSetup) {
		return compileBase(descriptor.scriptSetup.content);
	} else if (descriptor.script) {
		return compileBase(descriptor.script.content);
	}

	// TODO - Bail here? Or continue to allow SFC without a `<script>` tag?
	return {
		code: '',
		meta: MetaParser.parse(''),
		refVars: [],
		initialStateValues: {}
	};
}

module.exports = {
	compile
};