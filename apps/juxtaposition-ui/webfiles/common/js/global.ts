import type WiiULocalStorageAPI from '@pretendonetwork/wiiu-local-storage-types/local-storage';

export {};

declare global {
	// Injected by bundler
	var platform: 'ctr' | 'portal' | 'web';

	// Fix for typo in upstream types (uppercase L)
	var wiiuLocalStorage: WiiULocalStorageAPI;
}
