// Settings and Reports had an incorrect creation timestamp.
// This migration extracts the time from the _id field and moves it into the created_at field.
// ---
// This script is intended to run in mongosh:
// $ mongosh mongodb://localhost:27017/mydb 6-creation-date.js

print(`Correcting incorrect creation date`);

const resultSettings = db.settings.updateMany({}, [
	{
		$set: {
			created_at: {
				$toDate: "$_id"
			}
		}
	}
]);

const resultReports = db.reports.updateMany({}, [
	{
		$set: {
			created_at: {
				$toDate: "$_id"
			}
		}
	}
]);

print(`Updated ${resultSettings.modifiedCount} Settings documents!`);
print(`Updated ${resultReports.modifiedCount} Reports documents!`);
