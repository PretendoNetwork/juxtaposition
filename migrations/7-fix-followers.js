// A bug introduced in #481 meant that every user follow was actually following the first user in the DB
// This script restores the followers for that specific user.
//
// This does not fix the following_users for everyone. but missing items there should be harmless.
// That data can be fixed once it's moved to a relational database
// ---
// This script is intended to run in mongosh:
// $ mongosh mongodb://localhost:27017/mydb 7-fix-followers.js

const user = db.contents.findOne({ });

const followerPids = user.following_users;
const allFollowers = db.contents.find({ pid: { $in: followerPids }}, { followed_users: 1, pid: 1 }).toArray();
const followerMap = new Map(allFollowers.map(f => [Number(f.pid), f]));

const validFollowers = followerPids.filter(followerPid => {
	const follower = followerMap.get(Number(followerPid));
	if (!follower) return false;

	return (
		follower.followed_users.map(v=>Number(v)).includes(Number(user.pid))
	);
});

db.contents.updateOne(
	{ pid: user.pid },
	{
		$set: {
			following_users: validFollowers
		}
	}
);

print(`Removed ${user.following_users.length - validFollowers.length} invalid followers.`);
