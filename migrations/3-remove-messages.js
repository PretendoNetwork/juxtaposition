// Messages have been removed from frontend, this script will remove all messages (not posts) from the database
// ---
// This script is intended to run in mongosh:
// $ mongosh mongodb://localhost:27017/mydb 3-remove-messages.js

print(`Removing messages`);
const result = db.posts.deleteMany({
	message_to_pid: {
		$type: 2, // Must be string
		$ne: null // Must not be null (for extra safety)
	}
});

print(`Finished removing messages!`);
print(`Removed ${result.deletedCount} documents!`);
