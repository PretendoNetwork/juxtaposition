const { Schema, model } = require('mongoose');

const ReportSchema = new Schema({
	pid: Number,
	reported_by: Number,
	post_id: String,
	reason: Number,
	message: String,
	created_at: {
		type: Date,
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

ReportSchema.methods.resolve = async function (pid, note) {
	this.set('resolved', true);
	this.set('resolved_by', pid);
	this.set('resolved_at', new Date());
	this.set('note', note);
	await this.save();
};

const REPORT = model('REPORT', ReportSchema);

module.exports = {
	ReportSchema,
	REPORT
};
