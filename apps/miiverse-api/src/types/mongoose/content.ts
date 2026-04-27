import type { Model, HydratedDocument } from 'mongoose';

export interface IContent {
	pid: number;
	followed_communities: Array<string>;
	followed_users: Array<number>;
	following_users: Array<number>;
}

export type ContentModel = Model<IContent>;

export type HydratedContentDocument = HydratedDocument<IContent>;
