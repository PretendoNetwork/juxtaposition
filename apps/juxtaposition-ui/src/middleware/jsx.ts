import { renderToStaticMarkup } from 'react-dom/server';
import type { RequestHandler } from 'express';

const htmlDoctype = '<!DOCTYPE html>';

/**
 * Render JSX as static markup. Only static! No state or event handlers are supported.
 */
export const jsxRenderer: RequestHandler = (request, response, next) => {
	response.jsx = (el): typeof response => {
		response.send(htmlDoctype + '\n' + renderToStaticMarkup(el));
		return response;
	};

	response.jsxForDirectory = (elMap): typeof response => {
		const directory = request.directory;
		if (directory === 'ctr') {
			response.jsx(elMap.ctr);
			return response;
		}

		if (directory === 'portal') {
			response.jsx(elMap.portal);
			return response;
		}

		if (directory === 'web') {
			response.jsx(elMap.web);
			return response;
		}

		throw new Error('Invalid directory to render JSX for');
	};
	next();
};
