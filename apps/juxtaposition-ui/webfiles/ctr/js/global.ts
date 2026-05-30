export {};

declare global {
	interface Window {
		/** Are we emulating the Cave API -> i.e., is this a browser UA? */
		// This has to be a global since debug.js is an independent bundle context
		isDebugCave?: boolean;
	}
}
