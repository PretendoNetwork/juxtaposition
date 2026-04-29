import { Schema, model } from 'mongoose';
import type { IContent, ContentModel } from '@/types/mongoose/content';

const ContentSchema = new Schema<IContent, ContentModel>({
	pid: Number,
	followed_communities: {
		type: [String],
		default: []
	},
	followed_users: {
		type: [Number],
		default: []
	},
	following_users: {
		type: [Number],
		default: []
	}
});

export const Content = model<IContent, ContentModel>('Content', ContentSchema);
