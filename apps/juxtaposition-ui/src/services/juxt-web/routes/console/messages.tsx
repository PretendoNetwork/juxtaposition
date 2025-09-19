import crypto from 'crypto';
import express from 'express';
import { Snowflake as snowflake } from 'node-snowflake';
import { config } from '@/config';
import { database } from '@/database';
import { uploadPainting, uploadScreenshot } from '@/images';
import { CONVERSATION } from '@/models/conversation';
import { POST } from '@/models/post';
import { buildContext } from '@/services/juxt-web/views/context';
import { CtrMessagesView } from '@/services/juxt-web/views/ctr/messages';
import { CtrMessageThreadView } from '@/services/juxt-web/views/ctr/messageThread';
import { PortalMessagesView } from '@/services/juxt-web/views/portal/messages';
import { PortalMessageThreadView } from '@/services/juxt-web/views/portal/messageThread';
import { WebMessagesView } from '@/services/juxt-web/views/web/messages';
import { WebMessageThreadView } from '@/services/juxt-web/views/web/messageThread';
import { getAuthedRequest } from '@/types/middleware';
import { getInvalidPostRegex, getUserAccountData, getUserFriendPIDs } from '@/util';
import type { ScreenshotUrls } from '@/images';

export const messagesRouter = express.Router();

messagesRouter.get('/', async function (rawReq, res) {
	const req = getAuthedRequest(rawReq);
	const conversations = await database.getConversations(req.pid);
	res.jsxForDirectory({
		web: <WebMessagesView conversations={conversations} ctx={buildContext(res)} />,
		portal: <PortalMessagesView conversations={conversations} ctx={buildContext(res)} />,
		ctr: <CtrMessagesView conversations={conversations} ctx={buildContext(res)} />,
		disableDoctypeFor: ['ctr']
	});
});

messagesRouter.post('/new', async function (rawReq, res) {
	const req = getAuthedRequest(rawReq);
	let conversation = await database.getConversationByID(req.body.community_id);
	const user2 = await getUserAccountData(req.body.message_to_pid);
	const postId = await generatePostUID(21);
	const friends = await getUserFriendPIDs(user2.pid);
	if (!req.user.mii) {
		throw new Error('No mii found on user');
	}
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
	let paintingBlob: string | null = null;
	if (req.body._post_type === 'painting' && req.body.painting) {
		paintingBlob = await uploadPainting({
			blob: req.body.painting,
			autodetectFormat: false,
			isBmp: req.body.bmp === 'true',
			pid: req.pid,
			postId
		});
		if (paintingBlob === null) {
			res.status(422);
			return res.render(req.directory + '/error.ejs', {
				code: 422,
				message: 'Upload failed. Please try again later.'
			});
		}
	}
	let screenshots: ScreenshotUrls | null = null;
	if (req.body.screenshot) {
		screenshots = await uploadScreenshot({
			blob: req.body.screenshot,
			pid: req.pid,
			postId
		});
		if (screenshots === null) {
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
	if (body && getInvalidPostRegex().test(body)) {
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
		painting: paintingBlob ?? '',
		screenshot: screenshots?.full ?? '',
		screenshot_length: screenshots?.fullLength ?? 0,
		screenshot_thumb: screenshots?.thumb ?? '',
		screenshot_aspect: screenshots?.aspect ?? '',
		country_id: req.paramPackData ? req.paramPackData.country_id : 49,
		created_at: new Date(),
		feeling_id: req.body.feeling_id,
		id: postId,
		is_autopost: 0,
		is_spoiler: (req.body.spoiler) ? 1 : 0,
		is_app_jumpable: req.body.is_app_jumpable,
		language_id: req.body.language_id,
		mii: req.user.mii.data,
		mii_face_url: `${config.cdnDomain}/mii/${req.pid}/${miiFace}`,
		pid: req.pid,
		platform_id: req.paramPackData ? req.paramPackData.platform_id : 0,
		region_id: req.paramPackData ? req.paramPackData.region_id : 2,
		verified: (req.user.accessLevel >= 2),
		message_to_pid: req.body.message_to_pid
	};
	const newPost = new POST(document);
	await newPost.save();
	let postPreviewText;
	if (document.painting) {
		postPreviewText = 'sent a Drawing';
	} else if (document.body.length > 25) {
		postPreviewText = document.body.substring(0, 25) + '...';
	} else {
		postPreviewText = document.body;
	}
	await conversation.newMessage(postPreviewText, user2.pid);
	return res.redirect(`/friend_messages/${conversation.id}`);
});

messagesRouter.get('/new/:pid', async function (rawReq, res) {
	const req = getAuthedRequest(rawReq);
	const user2 = await getUserAccountData(parseInt(req.params.pid));
	const friends = await getUserFriendPIDs(user2.pid);
	if (!req.user || !user2) {
		return res.sendStatus(422);
	}
	if (!req.user.mii) {
		throw new Error('No mii found on user');
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
		mii_face_url: `${config.cdnDomain}/mii/${req.pid}/normal_face.png`,
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

messagesRouter.get('/:message_id', async function (rawReq, res) {
	const req = getAuthedRequest(rawReq);
	const conversation = await database.getConversationByID(req.params.message_id.toString());
	if (!conversation) {
		return res.sendStatus(404);
	}
	const user2 = conversation.users[0].pid === req.pid ? conversation.users[1] : conversation.users[0];
	if (req.pid !== conversation.users[0].pid && req.pid !== conversation.users[1].pid) {
		return res.redirect('/');
	}
	const messages = await database.getConversationMessages(conversation.id, 200, 0);

	await conversation.markAsRead(req.pid);
	res.jsxForDirectory({
		web: <WebMessageThreadView conversation={conversation} otherUser={user2} messages={messages} ctx={buildContext(res)} />,
		portal: <PortalMessageThreadView conversation={conversation} otherUser={user2} messages={messages} ctx={buildContext(res)} />,
		ctr: <CtrMessageThreadView conversation={conversation} otherUser={user2} messages={messages} ctx={buildContext(res)} />
	});
});

async function generatePostUID(length: number): Promise<string> {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await POST.findOne({ id });
	id = (inuse ? await generatePostUID(length) : id);
	return id;
}
