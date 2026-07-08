import type { Model, HydratedDocument } from 'mongoose';

export interface IContent {
	pid: number;
	followed_communities: Array<string>;
}

export type ContentModel = Model<IContent>;

export type HydratedContentDocument = HydratedDocument<IContent>;
