import fs from 'fs/promises';
import path from 'path';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { langsFolder } from '@/util';
import { config } from '@/config';
import type { i18n } from 'i18next';
import type en from '@/assets/locales/en.json';
import type { ParamPack } from '@/types/common/param-pack';

const entries = await fs.readdir(langsFolder, { withFileTypes: true });
const langFiles = entries
	.filter(v => v.isFile() && v.name.endsWith('.json'))
	.map(v => ({ filePath: path.join(v.parentPath, v.name), lang: path.basename(v.name, path.extname(v.name)).toUpperCase() }));
const loadedFiles = await Promise.all(langFiles.map(v => fs.readFile(v.filePath, 'utf8')));
const finalObject = Object.fromEntries(loadedFiles.map((v, i) => [langFiles[i].lang, { ns: JSON.parse(v) }]));

export const resources: Record<string, { ns: typeof en }> = {
	...finalObject
};

const fallbackLang = 'EN';
export function getLanguage(paramPack?: ParamPack | null): string | null {
	if (!paramPack) {
		return null;
	}

	// Not currently possible to get any other languages, maybe we can add an in-app selector later?
	const languageIdMap: Record<string, string> = {
		0: 'JA',
		1: 'EN',
		2: 'FR',
		3: 'DE',
		4: 'IT',
		5: 'ES',
		6: 'ZH',
		7: 'KO',
		8: 'NL',
		9: 'PT',
		10: 'RU',
		11: 'ZH'
	};

	return languageIdMap[paramPack.language_id] ?? null;
}

// Add a simple guard so we don't accidentally use non-localized i18n instances
await i18next.init({
	showSupportNotice: false, // Disable annoying log message
	saveMissing: true,
	missingKeyHandler() {
		throw new Error('global usage of `i18next.t()` is not allowed. Use `T.str()` instead');
	}
});

export async function createI18n(): Promise<i18n> {
	const i18n = i18next.createInstance({
		resources,
		fallbackLng: fallbackLang,
		defaultNS: 'ns',
		interpolation: {
			escapeValue: false // JSX already safes from xss
		},
		showSupportNotice: false, // Disable annoying log message
		react: {
			useSuspense: false
		}
	});

	await i18n.use(initReactI18next).init();

	if (config.dmBanner.text) {
		i18n.addResource(fallbackLang, 'ns', 'dmBannerText', config.dmBanner.text);
	}

	return i18n;
}
