import type { SelfFriendRequest } from '@/api/generated';

// Web doesn't render friend requests, so this file only holds the types.

export type FriendRequestListViewProps = {
	requests: SelfFriendRequest[];
};

export type FriendRequestItemProps = {
	request: SelfFriendRequest;
};
