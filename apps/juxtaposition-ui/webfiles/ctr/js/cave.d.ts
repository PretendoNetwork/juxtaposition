/* @pretendonetwork/cave-types DOES ship this in its module,
 * but I couldn't work out how to import it nicely... */
import type CaveAPI from '@pretendonetwork/cave-types/cave';

declare global {
	interface Window {
		/**
		 * Used by the Miiverse browser applet on the 3DS
		 */
		cave: CaveAPI;
	}

	/**
	 * Used by the Miiverse browser applet on the 3DS
	 */
	const cave: CaveAPI;
}
