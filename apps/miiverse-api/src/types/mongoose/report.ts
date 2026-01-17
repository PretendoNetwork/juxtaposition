import type { Model, HydratedDocument } from 'mongoose';

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

export type HydratedReportDocument = HydratedDocument<IReport>;
