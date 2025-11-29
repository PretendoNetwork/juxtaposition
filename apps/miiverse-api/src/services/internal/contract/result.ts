/* !!! HEY
 * This type has a copy in apps/juxtaposition-ui/src/api/result.ts
 * Make sure to copy over any modifications! */

export type ResultStr = 'success' | 'scheduled';

export type ResultDto = {
	status: ResultStr;
};

export function mapResult(status: ResultStr): ResultDto {
	return {
		status
	};
}
