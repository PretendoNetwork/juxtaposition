import xmlbuilder from 'xmlbuilder';
import type express from 'express';

export enum ApiErrorCode {
	UNKNOWN_ERROR = 0,
	SYSTEM_UPDATE_REQUIRED = 1,
	SETUP_NOT_COMPLETE = 2,
	SERVICE_MAINTENANCE = 3,
	SERVICE_CLOSED = 4,
	PARENTAL_CONTROLS_ENABLED = 5,
	POSTING_LIMITED_PARENTAL_CONTROLS = 6,
	ACCOUNT_BANNED = 7,
	ACCOUNT_POSTING_LIMITED = 8,
	DEVICE_BANNED = 9,
	DEVICE_POSTING_LIMITED = 10,
	PARTNER_SETUP_NOT_COMPLETE = 11,
	ERROR_SETUP_NOT_COMPLETE = 12, // TODO difference to 2?

	// Pretendo custom errors - these show a generic error on console
	NO_TOKEN = 15,
	BAD_TOKEN = 16,
	NO_PARAM_PACK = 17,
	BAD_PARAM_PACK = 18,
	NO_DISCOVERY_DATA = 19, // TODO this is a server config error, not a client error
	BAD_PARAMS = 20,

	ACCOUNT_SERVER_ERROR = 21,
	FRIENDS_SERVER_ERROR = 22,
	DATABASE_ERROR = 23,
	NOT_ALLOWED_SPAM = 24,

	// Matching HTTP errors so we get matching 115-5404 etc.
	NOT_ALLOWED = 403,
	NOT_FOUND = 404,

	BAD_WORDS_FILTER = 901,

	// Community errors
	CREATE_TOO_MANY_COMMUNITIES = 911,
	CREATE_TOO_MANY_FAVORITES_GAME = 912,
	CREATE_TOO_MANY_FAVORITES = 913,
	TOO_MANY_FAVORITES_GAME = 914,
	TOO_MANY_FAVORITES = 915,
	MUST_FAVORITE_OWN_COMMUNITY = 916,
	BAD_COMMUNITY_CODE = 917,
	NOT_FOUND_COMMUNITY = 919,

	FAIL_TOO_MANY_COMMENTS = 921,
	FAIL_USER_NOFOLLOW = 922,
	FAIL_NOT_FOUND_COMMUNITY = 925, // TODO difference to 919?
	FAIL_YEAH_OWN_POST = 926,
	FAIL_YEAH_POST = 927,
	FAIL_COMMUNITY_NOFAVORITE = 928,
	FAIL_NOT_FOUND_USER = 929,
	FAIL_USER_PRIVATE = 930,
	FAIL_NOT_FOUND_POST = 932,
	FAIL_POST_NOCOMMENT = 935
}

function sendXMLError(response: express.Response, errorCode: ApiErrorCode, httpCode: number): void {
	response.type('application/xml');
	response.status(httpCode);
	// Save this for the logger
	response.errorCode = errorCode;

	response.send(xmlbuilder.create({
		result: {
			has_error: 1,
			version: 1,
			code: httpCode,
			error_code: errorCode,
			message: ApiErrorCode[errorCode]
		}
	}).end({ pretty: true }));
}

export function badRequest(response: express.Response, errorCode: number, httpCode: number = 400): void {
	return sendXMLError(response, errorCode, httpCode);
}

export function serverError(response: express.Response, errorCode: ApiErrorCode, httpCode: number = 500): void {
	return sendXMLError(response, errorCode, httpCode);
}
