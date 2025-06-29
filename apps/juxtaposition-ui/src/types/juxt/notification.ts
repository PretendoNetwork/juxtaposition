export type Notification = {
	pid: number;
	type: 'notice' | 'yeah' | 'reply' | 'follow';
	text: string;
	image: string;
	link: string;
	objectID: string;
	userPID: number;
};
