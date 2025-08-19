import { Schema, model } from 'mongoose';
import { Snowflake as snowflake } from 'node-snowflake';

const user = new Schema({
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

export const ConversationSchema = new Schema({
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

ConversationSchema.methods.newMessage = async function (message, senderPID) {
	this.last_updated = new Date();
	this.message_preview = message;
	const sender = this.users.find(user => user.pid === senderPID);
	if (sender) {
		sender.read = false;
	}
	await this.save();
};

ConversationSchema.methods.markAsRead = async function (receiverPID) {
	const receiver = this.users.find(user => user.pid === receiverPID);
	if (receiver) {
		receiver.read = true;
	}
	await this.save();
};

export const CONVERSATION = model('CONVERSATION', ConversationSchema);
