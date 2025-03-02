const crypto = require('crypto');
const express = require('express');
const moment = require('moment');
const snowflake = require('node-snowflake').Snowflake;
const database = require('../../../../database');
const util = require('../../../../util');
const config = require('../../../../../config.json');
const { POST } = require('../../../../models/post');
const { CONVERSATION } = require('../../../../models/conversation');
const router = express.Router();

router.get('/', async function (req, res) {
	const conversations = await database.getConversations(req.pid);
	const usersMap = await util.getUserHash();
	res.render(req.directory + '/messages.ejs', {
		moment: moment,
		conversations: conversations,
		usersMap: usersMap
	});
});

router.post('/new', async function (req, res) {
	let conversation = await database.getConversationByID(req.body.community_id);
	const user2 = await util.getUserDataFromPid(req.body.message_to_pid);
	const postID = await generatePostUID(21);
	const friends = await util.getFriends(user2.pid);
	if (req.body.community_id === 0) {
		return res.sendStatus(404);
	}
	if (!conversation) {
		if (!req.user || !user2) {
			return res.sendStatus(422);
		}
		const document = {
			id: snowflake.nextId(),
			users: [
				{
					pid: req.pid,
					official: (req.user.accessLevel >= 2),
					read: true
				},
				{
					pid: user2.pid,
					official: (user2.accessLevel >= 2),
					read: false
				}
			]
		};
		const newConversations = new CONVERSATION(document);
		await newConversations.save();
		conversation = await database.getConversationByID(document.id);
	}
	if (!conversation) {
		return res.sendStatus(404);
	}
	if (!friends || friends.indexOf(req.pid) === -1) {
		return res.sendStatus(422);
	}
	if (req.body.body === '' && req.body.painting === '' && req.body.screenshot === '') {
		res.status(422);
		return res.redirect(`/friend_messages/${conversation.id}`);
	}
	let painting = '';
	let paintingURI = '';
	let screenshot = null;
	if (req.body._post_type === 'painting' && req.body.painting) {
		painting = req.body.painting.replace(/\0/g, '').trim();
		paintingURI = await util.processPainting(painting, true);
		if (!await util.uploadCDNAsset(`paintings/${req.pid}/${postID}.png`, paintingURI, 'public-read')) {
			res.status(422);
			return res.render(req.directory + '/error.ejs', {
				code: 422,
				message: 'Upload failed. Please try again later.'
			});
		}
	}
	if (req.body.screenshot) {
		screenshot = req.body.screenshot.replace(/\0/g, '').trim();
		if (await util.uploadCDNAsset(`screenshots/${req.pid}/${postID}.jpg`, Buffer.from(screenshot, 'base64'), 'public-read')) {
			res.status(422);
			return res.render(req.directory + '/error.ejs', {
				code: 422,
				message: 'Upload failed. Please try again later.'
			});
		}
	}

	let miiFace;
	switch (parseInt(req.body.feeling_id)) {
		case 1:
			miiFace = 'smile_open_mouth.png';
			break;
		case 2:
			miiFace = 'wink_left.png';
			break;
		case 3:
			miiFace = 'surprise_open_mouth.png';
			break;
		case 4:
			miiFace = 'frustrated.png';
			break;
		case 5:
			miiFace = 'sorrow.png';
			break;
		default:
			miiFace = 'normal_face.png';
			break;
	}
	const body = req.body.body;
	if (body && util.INVALID_POST_BODY_REGEX.test(body)) {
		// TODO - Log this error
		return res.sendStatus(422);
	}

	if (body && body.length > 280) {
		// TODO - Log this error
		return res.sendStatus(422);
	}

	const document = {
		community_id: conversation.id,
		screen_name: req.user.mii.name,
		body: body,
		painting: painting,
		screenshot: screenshot ? `/screenshots/${req.pid}/${postID}.jpg` : '',
		country_id: req.paramPackData ? req.paramPackData.country_id : 49,
		created_at: new Date(),
		feeling_id: req.body.feeling_id,
		id: postID,
		is_autopost: 0,
		is_spoiler: (req.body.spoiler) ? 1 : 0,
		is_app_jumpable: req.body.is_app_jumpable,
		language_id: req.body.language_id,
		mii: req.user.mii.data,
		mii_face_url: `${config.CDN_domain}/mii/${req.pid}/${miiFace}`,
		pid: req.pid,
		platform_id: req.paramPackData ? req.paramPackData.platform_id : 0,
		region_id: req.paramPackData ? req.paramPackData.region_id : 2,
		verified: (req.user.accessLevel >= 2),
		message_to_pid: req.body.message_to_pid
	};
	const duplicatePost = await database.getDuplicatePosts(req.pid, document);
	if (duplicatePost && req.params.post_id) {
		return res.redirect('/posts/' + req.params.post_id);
	}
	const newPost = new POST(document);
	newPost.save();
	res.redirect(`/friend_messages/${conversation.id}`);
	let postPreviewText;
	if (document.painting) {
		postPreviewText = 'sent a Drawing';
	} else if (document.body.length > 25) {
		postPreviewText = document.body.substring(0, 25) + '...';
	} else {
		postPreviewText = document.body;
	}
	await conversation.newMessage(postPreviewText, user2.pid);
});

router.get('/new/:pid', async function (req, res) {
	const user2 = await util.getUserDataFromPid(req.params.pid);
	const friends = await util.getFriends(user2.pid);
	if (!req.user || !user2) {
		return res.sendStatus(422);
	}
	let conversation = await database.getConversationByUsers([req.pid, user2.pid]);
	if (conversation) {
		return res.redirect(`/friend_messages/${conversation.id}`);
	}
	if (!friends || friends.indexOf(req.pid) === -1) {
		return res.sendStatus(422);
	}
	const document = {
		id: snowflake.nextId(),
		users: [
			{
				pid: req.user.pid,
				official: (req.user.accessLevel >= 2),
				read: true
			},
			{
				pid: user2.pid,
				official: (user2.accessLevel >= 2),
				read: false
			}
		]
	};
	const newConversations = new CONVERSATION(document);
	await newConversations.save();
	conversation = await database.getConversationByID(document.id);
	if (!conversation) {
		return res.sendStatus(404);
	}
	const body = `${req.user.mii.name} started a new chat!`;
	const newMessage = {
		screen_name: req.user.mii.name,
		body: body,
		created_at: new Date(),
		id: await generatePostUID(21),
		mii: req.user.mii.data,
		mii_face_url: `${config.CDN_domain}/mii/${req.pid}/normal_face.png`,
		pid: req.pid,
		verified: (req.user.accessLevel >= 2),
		parent: null,
		community_id: conversation.id,
		message_to_pid: user2.pid
	};
	const newPost = new POST(newMessage);
	newPost.save();
	await conversation.newMessage(`${req.user.mii.name} started a new chat!`, user2.pid);
	res.redirect(`/friend_messages/${conversation.id}`);
});

router.get('/:message_id', async function (req, res) {
	const conversation = await database.getConversationByID(req.params.message_id.toString());
	if (!conversation) {
		return res.sendStatus(404);
	}
	const user2 = conversation.users[0].pid === req.pid ? conversation.users[1] : conversation.users[0];
	if (req.pid !== conversation.users[0].pid && req.pid !== conversation.users[1].pid) {
		res.redirect('/');
	}
	const messages = await database.getConversationMessages(conversation.id, 200, 0);
	const userMap = await util.getUserHash();
	res.render(req.directory + '/message_thread.ejs', {
		moment: moment,
		user2: user2,
		conversation: conversation,
		messages: messages,
		userMap: userMap
	});
	await conversation.markAsRead(req.pid);
});

async function generatePostUID(length) {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await POST.findOne({ id });
	id = (inuse ? await generatePostUID() : id);
	return id;
}

module.exports = router;
