import type { Model, Types, HydratedDocument } from 'mongoose';

export type NotificationUser = {
	user: string;
	timestamp: Date;
};

export interface INotification {
	pid: string;
	type: string;
	link: string;
	image: string;
	text: string;
	objectID: string;
	users: Types.Array<NotificationUser>;
	read: boolean;
	lastUpdated: Date;
}

export type NotificationModel = Model<INotification>;

export type HydratedNotificationDocument = HydratedDocument<INotification>;
