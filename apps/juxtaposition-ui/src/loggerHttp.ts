import pinoHttp from 'pino-http';
import { logger } from '@/logger';
import { config } from '@/config';
import { decodeParamPack } from '@/util';
import type { SerializedRequest, SerializedResponse } from 'pino';
import type { Request } from 'express';
import type { ParamPack } from '@/types/common/param-pack';

type SerializedNintendoRequest = SerializedRequest & { param_pack?: ParamPack };

function redactHeaders(headers: Record<string, string>, allowlist: string[]): Record<string, string> {
	if (!config.log.sensitive) {
		// Redact sensitive header types
		return Object.fromEntries(Object.entries(headers).filter(([key, _value]) =>
			allowlist.includes(key)
		));
	} else {
		// The redaction case does a clone, so keep the semantics the same
		return Object.assign({}, headers);
	}
}

export const loggerHttp = pinoHttp({
	logger: logger,
	serializers: {
		req(req: SerializedNintendoRequest) {
			const raw = req.raw as Request;

			// Only log non-sensitive headers
			const allowlist = ['host', 'accept', 'accept-encoding', 'accept-language', 'cache-control', 'user-agent', 'referer', 'cf-ipcountry'];
			req.headers = redactHeaders(req.headers, allowlist);

			// Decode param pack if we have it
			const paramPack = raw.headers['x-nintendo-parampack'];
			if (typeof paramPack === 'string') {
				req.param_pack = decodeParamPack(paramPack);
			}

			req.remoteAddress = raw.ip ?? req.remoteAddress;

			return req;
		},
		res(res: SerializedResponse) {
			// Only log non-sensitive headers
			const allowlist = ['content-type', 'content-length', 'x-nintendo-whitelist'];
			res.headers = redactHeaders(res.headers, allowlist);

			return res;
		}
	}
});
