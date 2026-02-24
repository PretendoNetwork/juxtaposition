import type { FriendRequest } from '@pretendonetwork/grpc/friends/friend_request';
import type { RenderContext } from '@/services/juxt-web/views/context';

// Web doesn't render friend requests, so this file only holds the types.

export type FriendRequestListViewProps = {
	ctx: RenderContext;
	requests: FriendRequest[];
};

export type FriendRequestItemProps = {
	ctx: RenderContext;
	request: FriendRequest;
};
