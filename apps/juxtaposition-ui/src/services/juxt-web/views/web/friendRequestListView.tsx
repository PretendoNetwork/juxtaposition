import type { FriendRequest } from '@pretendonetwork/grpc/friends/friend_request';

// Web doesn't render friend requests, so this file only holds the types.

export type FriendRequestListViewProps = {
	requests: FriendRequest[];
};

export type FriendRequestItemProps = {
	request: FriendRequest;
};
