import type WiiULocalStorageAPI from '@pretendonetwork/wiiu-local-storage-types/local-storage';

export {};

declare global {
	// Injected by bundler
	var platform: 'ctr' | 'portal' | 'web';

	// Fix for typo in upstream types (uppercase L)
	var wiiuLocalStorage: WiiULocalStorageAPI;

	interface Window {
		/** Are we emulating the console API -> i.e., is this a browser UA? */
		// This has to be a global since debug.js is an independent bundle context
		isDebugCave?: boolean;
		isDebugPortal?: boolean;
	}
}
