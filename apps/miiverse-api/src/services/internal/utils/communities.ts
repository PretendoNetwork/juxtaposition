import { Community } from '@/models/community';

export async function generateCommunityId(length?: number | undefined): Promise<string> {
	let id = crypto.getRandomValues(new Uint32Array(1)).toString().substring(0, length);
	const inuse = await Community.findOne({ community_id: id });
	id = (inuse ? await generateCommunityId(length) : id);
	return id;
}

export const accountStatusDisplayMap: Record<number, string> = {
	0: 'Normal',
	1: 'Limited from Posting',
	2: 'Temporary Ban',
	3: 'Permanent Ban'
};

export const communityTypeDisplayMap: Record<number, string> = {
	0: 'Main',
	1: 'Sub',
	2: 'Announcement',
	3: 'Private'
};

export const communityPlatformDisplayMap: Record<number, string> = {
	0: 'Wii U',
	1: '3DS',
	2: 'Both'
};
