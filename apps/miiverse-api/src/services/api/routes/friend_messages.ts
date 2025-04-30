import express from 'express';
import multer from 'multer';
import { Snowflake } from 'node-snowflake';
import moment from 'moment';
import xmlbuilder from 'xmlbuilder';
import { z } from 'zod';
import {
	getUserFriendPIDs,
	getUserAccountData,
	processPainting,
	uploadCDNAsset,
	getValueFromQueryString,
	INVALID_POST_BODY_REGEX
} from '@/util';
import { getConversationByUsers, getFriendMessages } from '@/database';
import { Post } from '@/models/post';
import { Conversation } from '@/models/conversation';
import { config } from '@/config';
import { ApiErrorCode, badRequest, serverError } from '@/errors';
import type { FormattedMessage } from '@/types/common/formatted-message';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';

const sendMessageSchema = z.object({
	body: z.string().optional(),
	painting: z.string().optional(),
	screenshot: z.string().optional(),
	app_data: z.string().optional(),
	feeling_id: z.string(),
	is_autopost: z.string(),
	number: z.string(),
	message_to_pid: z.string().transform(Number)
});

const router = express.Router();
const upload = multer();

router.post('/', upload.none(), async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	// TODO - Better error codes, maybe do defaults?
	const bodyCheck = sendMessageSchema.safeParse(request.body);

	if (!bodyCheck.success) {
		request.log.warn('Body check failed!');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	const recipientPID = bodyCheck.data.message_to_pid;
	const messageBody = bodyCheck.data.body?.trim() || '';
	const painting = bodyCheck.data.painting?.replace(/\0/g, '').trim() || '';
	const screenshot = bodyCheck.data.screenshot?.trim().replace(/\0/g, '').trim() || '';
	const appData = bodyCheck.data.app_data?.replace(/[^A-Za-z0-9+/=\s]/g, '').trim() || '';

	if (isNaN(recipientPID)) {
		request.log.warn('Message recipient is NaN');
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_USER);
	}

	if (!request.user) {
		return badRequest(response, ApiErrorCode.ACCOUNT_SERVER_ERROR);
	}

	const sender = request.user;

	if (!sender.mii) {
		// * This should never happen, but TypeScript complains so check anyway
		request.log.warn('Mii does not exist or is invalid');
		return badRequest(response, ApiErrorCode.ACCOUNT_SERVER_ERROR);
	}

	let recipient: GetUserDataResponse;

	try {
		recipient = await getUserAccountData(recipientPID);
	} catch (err) {
		request.log.warn(err, `Failed to get account data for recipient ${recipientPID}`);
		return badRequest(response, ApiErrorCode.PARTNER_SETUP_NOT_COMPLETE);
	}

	let conversation = await getConversationByUsers([sender.pid, recipient.pid]);

	if (!conversation) {
		conversation = await Conversation.create({
			id: Snowflake.nextId(),
			users: [
				{
					pid: sender.pid,
					official: (sender.accessLevel === 2 || sender.accessLevel === 3),
					read: true
				},
				{
					pid: recipient.pid,
					official: (recipient.accessLevel === 2 || recipient.accessLevel === 3),
					read: false
				}
			]
		});
	}

	if (!conversation) {
		return serverError(response, ApiErrorCode.DATABASE_ERROR);
	}

	const friendPIDs = await getUserFriendPIDs(recipient.pid);

	if (friendPIDs.indexOf(request.pid) === -1) {
		request.log.warn('User isn\'t friend of recipient');
		return badRequest(response, ApiErrorCode.NOT_ALLOWED, 403);
	}

	let miiFace = 'normal_face.png';
	switch (parseInt(request.body.feeling_id)) {
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
	}

	if (messageBody && INVALID_POST_BODY_REGEX.test(messageBody)) {
		request.log.warn('Message body failed regex');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	if (messageBody && messageBody.length > 280) {
		request.log.warn('Message body too long');
		return badRequest(response, ApiErrorCode.BAD_PARAMS);
	}

	if (!messageBody?.trim() && !painting?.trim() && !screenshot?.trim()) {
		request.log.warn('Message content is empty');
		badRequest(response, ApiErrorCode.BAD_PARAMS);
		response.redirect(`/friend_messages/${conversation.id}`);
		return;
	}

	const post = await Post.create({
		title_id: request.paramPack.title_id,
		community_id: conversation.id,
		screen_name: sender.mii.name,
		body: messageBody,
		app_data: appData,
		painting: painting,
		screenshot: '',
		screenshot_length: 0,
		country_id: request.paramPack.country_id,
		created_at: new Date(),
		feeling_id: request.body.feeling_id,
		search_key: request.body.search_key,
		topic_tag: request.body.topic_tag,
		is_autopost: request.body.is_autopost,
		is_spoiler: (request.body.spoiler) ? 1 : 0,
		is_app_jumpable: request.body.is_app_jumpable,
		language_id: request.body.language_id,
		mii: sender.mii.data,
		mii_face_url: `${config.cdnUrl}/mii/${sender.pid}/${miiFace}`,
		pid: request.pid,
		platform_id: request.paramPack.platform_id,
		region_id: request.paramPack.region_id,
		verified: (sender.accessLevel === 2 || sender.accessLevel === 3),
		message_to_pid: request.body.message_to_pid,
		parent: null,
		removed: false
	});

	if (painting) {
		const paintingBuffer = await processPainting(painting);

		if (paintingBuffer) {
			await uploadCDNAsset(`paintings/${request.pid}/${post.id}.png`, paintingBuffer, 'public-read');
		} else {
			request.log.warn(`PAINTING FOR POST ${post.id} FAILED TO PROCESS`);
		}
	}

	if (screenshot) {
		const screenshotBuffer = Buffer.from(screenshot, 'base64');

		await uploadCDNAsset(`screenshots/${request.pid}/${post.id}.jpg`, screenshotBuffer, 'public-read');

		post.screenshot = `/screenshots/${request.pid}/${post.id}.jpg`;
		post.screenshot_length = screenshot.length;

		await post.save();
	}

	let postPreviewText = messageBody;
	if (painting) {
		postPreviewText = 'sent a Drawing';
	} else if (messageBody.length > 25) {
		postPreviewText = messageBody.substring(0, 25) + '...';
	}

	await conversation.newMessage(postPreviewText, recipientPID);

	response.sendStatus(200);
});

router.get('/', async function (request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');

	const limitString = getValueFromQueryString(request.query, 'limit')[0];

	// TODO - Is this the limit?
	let limit = 10;

	if (limitString) {
		limit = parseInt(limitString);
	}

	if (isNaN(limit)) {
		limit = 10;
	}

	if (!request.query.search_key) {
		request.log.warn('Search key not provided');
		return badRequest(response, ApiErrorCode.FAIL_NOT_FOUND_POST, 404);
	}

	const searchKey = getValueFromQueryString(request.query, 'search_key');

	const messages = await getFriendMessages(request.pid.toString(), searchKey, limit);

	const postBody: FormattedMessage[] = [];
	for (const message of messages) {
		postBody.push({
			post: {
				body: message.body,
				country_id: message.country_id || 0,
				created_at: moment(message.created_at).format('YYYY-MM-DD HH:MM:SS'),
				feeling_id: message.feeling_id || 0,
				id: message.id,
				is_autopost: message.is_autopost,
				is_spoiler: message.is_spoiler,
				is_app_jumpable: message.is_app_jumpable,
				empathy_added: message.empathy_count,
				language_id: message.language_id,
				message_to_pid: message.message_to_pid,
				mii: message.mii,
				mii_face_url: message.mii_face_url,
				number: message.number || 0,
				pid: message.pid,
				platform_id: message.platform_id || 0,
				region_id: message.region_id || 0,
				reply_count: message.reply_count,
				screen_name: message.screen_name,
				topic_tag: {
					name: message.topic_tag,
					title_id: 0
				},
				title_id: message.title_id
			}
		});
	}

	response.send(xmlbuilder.create({
		result: {
			has_error: 0,
			version: 1,
			request_name: 'friend_messages',
			posts: postBody
		}
	}, { separateArrayItems: true }).end({ pretty: true }));
});

router.post('/:post_id/empathies', upload.none(), async function (_request: express.Request, response: express.Response): Promise<void> {
	response.type('application/xml');
	// TODO - FOR JEMMA! FIX THIS! MISSING MONGOOSE SCHEMA METHODS
	// * Remove the underscores from request and response to make them seen by eslint again
	/*
	let pid = getPIDFromServiceToken(req.headers["x-nintendo-servicetoken"]);
	const post = await getPostByID(req.params.post_id);
	if(pid === null) {
		res.sendStatus(403);
		response.sendStatus(400);
		return;
	}
	let user = await getUserByPID(pid);
	if(user.likes.indexOf(post.id) === -1 && user.id !== post.pid)
	{
		post.upEmpathy();
		user.addToLikes(post.id)
		res.sendStatus(200);
	}
	else
		res.sendStatus(403);
	*/
});

export default router;
