export type NotificationCreateArgs = FollowNotificationCreateArgs | NoticeNotificationCreateArgs;

export type FollowNotificationCreateArgs = {
	pid: number;
	type: 'follow';
	link: string;
	objectID: string;
};

export type NoticeNotificationCreateArgs = {
	pid: number;
	type: 'notice';
	text: string;
	image: string;
	link: string;
};
