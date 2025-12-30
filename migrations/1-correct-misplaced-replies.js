// Due to a bug in post creation, it was possible to create a reply in a different community than the original post.
// This database script will correct all replies to be in the correct community.
// ---
// This script is intended to run in mongosh:
// $ mongosh mongodb://localhost:27017/mydb 1-correct-misplaced-replies.js
// It takes roughly 10 minutes on production database

print("Ensure indexes")
db.posts.createIndex({ id: 1 });
db.posts.createIndex({ parent: 1 });
db.posts.createIndex({ processed: 1 });

print("Preparing root posts")
db.posts.updateMany(
	{ parent: null },
	{ $set: { processed: true } }
);

let misplacedCount = 0;
let updatedCount = 0;
do {
	print("Starting scan for replies")
	const result = db.posts.aggregate([
		{
			$match: {
				processed: { $ne: true }, // Skip processed posts from batch
				parent: { $type: "string" } // Only replies
			}
		},

		// Join parent
		{
			$lookup: {
				from: "posts",
				localField: "parent",
				foreignField: "id",
				as: "parentPost"
			}
		},
		{ $unwind: "$parentPost" },

		// Only process posts that have been processed
		// This was we can do it iteratively instead of recursively
		{
			$match: {
				"parentPost.processed": true
			}
		},

		// Add post ID and community ID to output
		{
			$project: {
				_id: 1,
				id: 1,
				community_id: 1,
				new_community_id: "$parentPost.community_id"
			}
		}
	]).toArray();

	updatedCount = result.length;
	const ids = result.map(v=>v._id);
	const updates = result.filter(v=>v.community_id !== v.new_community_id);
	print(`Found ${updates.length} misplaced replies`)

	if (updates.length > 0) {
		misplacedCount += updates.length;

		db.posts.bulkWrite(
			updates.map(doc => ({
				updateOne: {
					filter: { id: doc.id },
					update: {
						$set: {
							community_id: doc.new_community_id,
							processed: true
						}
					}
				}
			}))
		);

		print(`Corrected ${updates.length} misplaced replies`)
	}

	print(`Tagging current batch of posts`)
	db.posts.updateMany({
		_id: {
			$in: ids,
		}
	}, {
		$set: {
			processed: true,
		}
	});

	print(`Processed ${updatedCount} posts`);
} while (updatedCount > 0);
print(`Finished processing all posts`);

print(`Cleaning up...`);
db.posts.updateMany(
  { processed: true },
  { $unset: { processed: "" } }
);
print(`Finished cleaning up!`);
print(`Corrected ${misplacedCount} replies!`);
