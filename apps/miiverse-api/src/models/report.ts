import { Schema, model } from 'mongoose';
import type { IReport, ReportModel } from '@/types/mongoose/report';

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

export const Report = model<IReport, ReportModel>('Report', ReportSchema);
