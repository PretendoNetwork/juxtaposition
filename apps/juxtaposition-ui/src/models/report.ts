import { Schema, model } from 'mongoose';
import type { HydratedDocument, Model } from 'mongoose';

export interface IReport {
	pid: number;
	reported_by: number;
	post_id: string;
	reason: number;
	message: string;
	created_at: Date;
	resolved?: boolean | null;
	note?: string | null;
	resolved_by?: number | null;
	resolved_at?: Date | null;
}

export type ReportModel = Model<IReport>;
export type HydratedReportDocument = HydratedDocument<IReport, IReportMethods>;

export interface IReportMethods {
	resolve(pid: number, note: string | null): Promise<void>;
}

export const ReportSchema = new Schema<IReport, ReportModel, IReportMethods>({
	pid: {
		type: Number,
		required: true
	},
	reported_by: {
		type: Number,
		required: true
	},
	post_id: {
		type: String,
		required: true
	},
	reason: {
		type: Number,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	created_at: {
		type: Date,
		required: true,
		default: new Date()
	},
	resolved: {
		type: Boolean,
		default: false
	},
	note: String,
	resolved_by: Number,
	resolved_at: Date
});

ReportSchema.method<HydratedReportDocument>('resolve', async function (pid, note) {
	this.set('resolved', true);
	this.set('resolved_by', pid);
	this.set('resolved_at', new Date());
	this.set('note', note);
	await this.save();
});

export const Report = model<IReport, ReportModel>('Report', ReportSchema);
export const REPORT = Report;
