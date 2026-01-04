import { Schema, model } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

export type Endpoint = {
	status: number;
	server_access_level: string;
	topics: boolean;
	guest_access: boolean;
	new_users: boolean;
	host: string;
	api_host: string;
	portal_host: string;
	n3ds_host: string;
} & Document;

export type HydratedEndpointDocument = HydratedDocument<Endpoint>;

export const endpointSchema = new Schema<Endpoint>({
	status: Number,
	server_access_level: String,
	topics: Boolean,
	guest_access: Boolean,
	new_users: {
		type: Boolean,
		default: true
	},
	host: String,
	api_host: String,
	portal_host: String,
	n3ds_host: String
});

export const Endpoint = model('ENDPOINT', endpointSchema);
export const ENDPOINT = Endpoint;
