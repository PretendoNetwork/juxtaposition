import type en from '@/assets/locales/en.json';

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: {
			ns: (typeof en) & {
				dmBannerText: string;
			};
		};
		defaultNS: 'ns';
	}
}
