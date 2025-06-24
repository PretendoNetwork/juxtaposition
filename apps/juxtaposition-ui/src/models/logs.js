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
	actor: {
		type: Number,
		required: true
	},
	action: {
		type: String,
		enum: actionEnum,
		required: true
	},
	target: {
		type: String,
		required: true
	},
	context: {
		type: String,
		required: true
	},
	timestamp: {
		type: Date,
		default: Date.now,
		required: true
	},
	changed_fields: {
		type: [String],
		default: [],
		required: true
	}
});

const LOGS = model('LOGS', auditLogSchema);

module.exports = {
	auditLogSchema,
	LOGS
};
