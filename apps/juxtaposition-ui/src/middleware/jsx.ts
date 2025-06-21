import { renderToStaticMarkup } from 'react-dom/server';
import type { RequestHandler } from 'express';

const htmlDoctype = '<!DOCTYPE html>';

/**
 * Render JSX as static markup. Only static! No state or event handlers are supported.
 */
export const jsxRenderer: RequestHandler = (_request, response, next) => {
	response.jsx = (el): typeof response => {
		response.send(htmlDoctype + '\n' + renderToStaticMarkup(el));
		return response;
	};
	next();
};
