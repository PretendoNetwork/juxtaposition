/* !!! HEY
 * This type lives in apps/miiverse-api/src/services/internal/contract/result.ts
 * Modify it there and copy-paste here! */

export type ResultStr = 'success' | 'scheduled';

export type ResultDto = {
	status: ResultStr;
};
