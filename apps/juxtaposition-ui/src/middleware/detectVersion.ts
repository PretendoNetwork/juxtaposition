import { processLanguage } from '@/util';
import type { Request, RequestHandler } from 'express';

export const detectVersion: RequestHandler = async (request, response, next) => {
	// Check the domain and set the directory
	if (includes(request, 'juxt')) {
		request.directory = 'web';
		response.locals.lang = processLanguage();
	} else {
		request.directory = includes(request, 'portal') ? 'portal' : 'ctr';
	}

	request.isWrite = request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE';

	next();
};

function includes(request: Request, domain: string): boolean {
	return request.subdomains.findIndex(element => element.includes(domain)) !== -1;
}
