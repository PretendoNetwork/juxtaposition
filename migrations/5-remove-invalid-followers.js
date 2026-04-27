// UserContent model always had a `0` element when it was created. This migration fixes the data.
// This also fixes some old data format that uses "announcements" as a community ID
// ---
// This script is intended to run in mongosh:
// $ mongosh mongodb://localhost:27017/mydb 5-remove-invalid-followers.js

print(`Correcting invalid followers`);

const result = db.contents.updateMany({}, {
	$pull: {
		followed_communities: {
            $in: ["0", "announcements"]
		},
		followed_users: 0,
		following_users: 0,
	},
});

print(`Updated ${result.modifiedCount}/${result.matchedCount} documents!`);
