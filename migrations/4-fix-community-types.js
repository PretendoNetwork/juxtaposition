// Production has some instances of incorrect community types, this corrects them
// ---
// This script is intended to run in mongosh:
// $ mongosh mongodb://localhost:27017/mydb 4-fix-community-types.js

print(`Correcting incorrect subcommunities`);

const result = db.communities.updateMany({
	type: {
		$in: [0, 2], // Non-subcommunity types...
	},
	parent: {
		$ne: null, // .. that are subcommunities
	}
}, {
	$set: {
		type: 3, // Set to private
	}
});

print(`Updated ${result.modifiedCount}/${result.matchedCount} documents!`);
