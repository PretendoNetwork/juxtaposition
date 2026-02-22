import fs from 'fs/promises';
import path from 'path';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { langsFolder } from '@/util';
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

export function getLanguage(paramPack?: ParamPack | null): string {
	const fallback = 'EN';
	if (!paramPack) {
		return fallback;
	}
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

	return languageIdMap[paramPack.language_id] ?? fallback;
}

export const createI18n = (lang: string): any => i18next
	.use(initReactI18next)
	.init({
		lng: lang,
		resources,
		defaultNS: 'ns',
		interpolation: {
			escapeValue: false // JSX already safes from xss
		}
	});
