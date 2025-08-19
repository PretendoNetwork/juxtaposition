import { Schema, model } from 'mongoose';

export const NotificationSchema = new Schema({
	pid: String,
	type: String,
	link: String,
	image: String,
	text: String,
	objectID: String,
	users: [{
		user: String,
		timestamp: Date
	}],
	read: Boolean,
	lastUpdated: Date
});

NotificationSchema.methods.markRead = async function () {
	this.set('read', true);
	await this.save();
};

export const NOTIFICATION = model('NOTIFICATION', NotificationSchema);
