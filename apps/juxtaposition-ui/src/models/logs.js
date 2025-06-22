const { Schema, model } = require('mongoose');

const actionEnum = [
	'REMOVE_POST',
	'IGNORE_REPORT',
	'LIMIT_POSTING',
	'TEMP_BAN',
	'PERMA_BAN',
	'UNBAN',
	'UPDATE_USER',
	'MAKE_COMMUNITY',
	'UPDATE_COMMUNITY',
	'DELETE_COMMUNITY'
];

const auditLogSchema = new Schema({
	actor: Number,
	action: {
		type: String,
		enum: actionEnum
	},
	target: String,
	context: String,
	timestamp: {
		type: Date,
		default: Date.now
	}
});

const LOGS = model('LOGS', auditLogSchema);

module.exports = {
	auditLogSchema,
	LOGS
};
