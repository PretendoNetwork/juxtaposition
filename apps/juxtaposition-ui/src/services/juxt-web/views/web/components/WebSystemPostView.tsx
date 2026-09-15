import type { ReactNode } from 'react';
import type { UserProfile } from '@/api/generated';

export type SystemPostViewProps = {
	type: 'community-comment' | 'profile-comment' | 'system';
	author?: UserProfile;

	children: ReactNode | ReactNode[];
};
