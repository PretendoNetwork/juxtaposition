import { createI18n } from '@/i18n';
import type { RequestHandler } from 'express';

export const i18nMiddleware: RequestHandler = async (req, res, next) => {
	(res as any).lang = undefined;
	res.i18n = await createI18n();

	res.changeLanguage = (lang: string | null): typeof res => {
		(res as any).lang = lang ?? undefined;
		res.i18n.changeLanguage(res.lang);
		return res;
	};

	next();
};
