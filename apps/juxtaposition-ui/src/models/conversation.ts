import { Schema, model } from 'mongoose';
import { Snowflake as snowflake } from 'node-snowflake';
import type { HydratedDocument, Types } from 'mongoose';

export type ConversationUser = {
	pid: number;
	official: boolean;
	read: boolean;
} & Document;

export type Conversation = {
	id: string;
	created_at: Date;
	last_updated: Date;
	message_preview: string;
	users: Types.Array<ConversationUser>;

	newMessage(message: string, senderPid: number): Promise<void>;
	markAsRead(receiverPid: number): Promise<void>;
} & Document;

export type HydratedConversationDocument = HydratedDocument<Conversation>;

const user = new Schema<ConversationUser>({
	pid: Number,
	official: {
		type: Boolean,
		default: false
	},
	read: {
		type: Boolean,
		default: true
	}
});

export const ConversationSchema = new Schema<Conversation>({
	id: {
		type: String,
		default: snowflake.nextId()
	},
	created_at: {
		type: Date,
		default: new Date()
	},
	last_updated: {
		type: Date,
		default: new Date()
	},
	message_preview: {
		type: String,
		default: ''
	},
	users: [user]
});

ConversationSchema.method<HydratedConversationDocument>('newMessage', async function (message, senderPID) {
	this.last_updated = new Date();
	this.message_preview = message;
	const sender = this.users.find(user => user.pid === senderPID);
	if (sender) {
		sender.read = false;
	}
	await this.save();
});

ConversationSchema.method<HydratedConversationDocument>('markAsRead', async function (receiverPID) {
	const receiver = this.users.find(user => user.pid === receiverPID);
	if (receiver) {
		receiver.read = true;
	}
	await this.save();
});

export const CONVERSATION = model('CONVERSATION', ConversationSchema);
