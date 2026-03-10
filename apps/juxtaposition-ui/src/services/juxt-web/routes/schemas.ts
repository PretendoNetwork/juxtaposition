import { z } from 'zod';

export const zodCommaSeperatedList = z.string().trim()
	.transform(v => v.replaceAll(' ', '').split(',').filter(v => v.length > 0))
	.pipe(z.array(z.string().min(1)));
