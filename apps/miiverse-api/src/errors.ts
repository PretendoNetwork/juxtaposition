import xmlbuilder from 'xmlbuilder';
import type express from 'express';

export function badRequest(response: express.Response, errorCode: number, message: string): void {
	response.type('application/xml');
	response.status(400);

	response.send(xmlbuilder.create({
		result: {
			has_error: 1,
			version: 1,
			code: 400,
			error_code: errorCode,
			message: message
		}
	}).end({ pretty: true }));
}
