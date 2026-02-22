// Due to a typo in image handling, some posts are marked as 5:4 when the true aspect is 5:3.
// ---
// This script is intended to run in mongosh:
// $ mongosh mongodb://localhost:27017/mydb 2-correct-screenshot-aspect.js
// It takes roughly 1 minute on production database

print(`Update post screenshots`);
const result = db.posts.updateMany(
	{ screenshot_aspect: "5:4" },
	{ $set: { screenshot_aspect: "5:3" } }
);

print(`Finished updating screenshots!`);
print(`Corrected ${result.modifiedCount}/${result.matchedCount} screenshots!`);
