const crypto = require('crypto');
const grpc = require('nice-grpc');
const { AccountDefinition } = require('@pretendonetwork/grpc/account/account_service');
const { FriendsDefinition } = require('@pretendonetwork/grpc/friends/friends_service');
const { APIDefinition } = require('@pretendonetwork/grpc/api/api_service');
const HashMap = require('hashmap');
const TGA = require('tga');
const imagePixels = require('image-pixels');
const pako = require('pako');
const PNG = require('pngjs').PNG;
const bmp = require('bmp-js');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crc32 = require('crc/crc32');
const config = require('../config.json');
const database = require('./database');
const translations = require('./translations');
const { COMMUNITY } = require('./models/communities');
const { NOTIFICATION } = require('./models/notifications');
const logger = require('./logger');
const { CONTENT } = require('./models/content');
const { SETTINGS } = require('./models/settings');
const communityMap = new HashMap();
const userMap = new HashMap();

const { ip: friendsIP, port: friendsPort, api_key: friendsKey } = config.grpc.friends;
const friendsChannel = grpc.createChannel(`${friendsIP}:${friendsPort}`);
const friendsClient = grpc.createClient(FriendsDefinition, friendsChannel);

const { ip: apiIP, port: apiPort, api_key: apiKey } = config.grpc.account;
const apiChannel = grpc.createChannel(`${apiIP}:${apiPort}`);
const apiClient = grpc.createClient(APIDefinition, apiChannel);

const accountChannel = grpc.createChannel(`${apiIP}:${apiPort}`);
const accountClient = grpc.createClient(AccountDefinition, accountChannel);

const s3 = new S3Client({
	endpoint: config.aws.endpoint,
	forcePathStyle: true,
	region: config.aws.region,
	credentials: {
		accessKeyId: config.aws.spaces.key,
		secretAccessKey: config.aws.spaces.secret
	}
});

nameCache();

function nameCache() {
	database.connect().then(async () => {
		const communities = await COMMUNITY.find();
		if (communities !== null) {
			for (let i = 0; i < communities.length; i++) {
				if (communities[i].title_id !== null) {
					for (let j = 0; j < communities[i].title_id.length; j++) {
						communityMap.set(communities[i].title_id[j], communities[i].name);
						communityMap.set(communities[i].title_id[j] + '-id', communities[i].olive_community_id);
					}
					communityMap.set(communities[i].olive_community_id, communities[i].name);
				}
			}
			logger.success('Created community index of ' + communities.length + ' communities');
		}
		const users = await database.getUsersSettings(-1);
		if (users !== null) {
			for (let i = 0; i < users.length; i++) {
				if (users[i].pid !== null) {
					userMap.set(users[i].pid, users[i].screen_name.replace(/[\u{0080}-\u{FFFF}]/gu, '').replace(/\u202e/g, ''));
				}
			}
			logger.success('Created user index of ' + users.length + ' users');
		}
	}).catch((error) => {
		logger.error(error);
	});
}

// TODO - This doesn't belong here, just hacking it in. Gonna redo this whole server anyway so fuck it
const INVALID_POST_BODY_REGEX = /[^\p{L}\p{P}\d\n\r$^¨←→↑↓√¦⇒⇔¤¢€£¥™©®+×÷=±∞˘˙¸˛˜°¹²³♭♪¬¯¼½¾♡♥●◆■▲▼☆★♀♂<> ]/gu;
async function create_user(pid, experience, notifications) {
	const pnid = await this.getUserDataFromPid(pid);
	if (!pnid) {
		return;
	}
	const newSettings = {
		pid: pid,
		screen_name: pnid.mii.name,
		game_skill: experience,
		receive_notifications: notifications
	};
	const newContent = {
		pid: pid
	};
	const newSettingsObj = new SETTINGS(newSettings);
	await newSettingsObj.save();

	const newContentObj = new CONTENT(newContent);
	await newContentObj.save();

	this.setName(pid, pnid.mii.name);
}
function decodeParamPack(paramPack) {
	/*  Decode base64 */
	let dec = Buffer.from(paramPack, 'base64').toString('ascii');
	/*  Remove starting and ending '/', split into array */
	dec = dec.slice(1, -1).split('\\');
	/*  Parameters are in the format [name, val, name, val]. Copy into out{}. */
	const out = {};
	for (let i = 0; i < dec.length; i += 2) {
		out[dec[i].trim()] = dec[i + 1].trim();
	}
	return out;
}
function processServiceToken(encryptedToken) {
	try {
		const B64token = Buffer.from(encryptedToken, 'base64');
		const decryptedToken = this.decryptToken(B64token);
		const token = this.unpackToken(decryptedToken);

		// * Only allow token types 1 (Wii U) and 2 (3DS)
		if (token.system_type !== 1 && token.system_type !== 2) {
			return null;
		}

		return token.pid;
	} catch (e) {
		console.error(e);
		return null;
	}
}
function decryptToken(token) {
	if (!config.aes_key) {
		throw new Error('Service token AES key not found. Set config.aes_key');
	}

	const iv = Buffer.alloc(16);
	const key = Buffer.from(config.aes_key, 'hex');

	const expectedChecksum = token.readUint32BE();
	const encryptedBody = token.subarray(4);

	const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

	const decrypted = Buffer.concat([
		decipher.update(encryptedBody),
		decipher.final()
	]);

	if (expectedChecksum !== crc32(decrypted)) {
		throw new Error('Checksum did not match. Failed decrypt. Are you using the right key?');
	}

	return decrypted;
}
function unpackToken(token) {
	return {
		system_type: token.readUInt8(0x0),
		token_type: token.readUInt8(0x1),
		pid: token.readUInt32LE(0x2),
		expire_time: token.readBigUInt64LE(0x6),
		title_id: token.readBigUInt64LE(0xE),
		access_level: token.readInt8(0x16)
	};
}
async function processPainting(painting, isTGA) {
	if (isTGA) {
		const paintingBuffer = Buffer.from(painting, 'base64');
		let output = '';
		try {
			output = pako.inflate(paintingBuffer);
		} catch (err) {
			console.error(err);
		}
		let tga;
		try {
			tga = new TGA(Buffer.from(output));
		} catch (e) {
			console.error(e);
			return null;
		}
		const png = new PNG({
			width: tga.width,
			height: tga.height
		});
		png.data = tga.pixels;
		return PNG.sync.write(png);
		// return `data:image/png;base64,${pngBuffer.toString('base64')}`;
	} else {
		const paintingBuffer = Buffer.from(painting, 'base64');
		const bitmap = bmp.decode(paintingBuffer);
		const tga = this.createBMPTgaBuffer(bitmap.width, bitmap.height, bitmap.data, false);

		let output;
		try {
			output = pako.deflate(tga, { level: 6 });
		} catch (err) {
			console.error(err);
		}
		return new Buffer(output).toString('base64');
	}
}
function nintendoPasswordHash(password, pid) {
	const pidBuffer = Buffer.alloc(4);
	pidBuffer.writeUInt32LE(pid);

	const unpacked = Buffer.concat([
		pidBuffer,
		Buffer.from('\x02\x65\x43\x46'),
		Buffer.from(password)
	]);
	return crypto.createHash('sha256').update(unpacked).digest().toString('hex');
}
function getCommunityHash() {
	return communityMap;
}
function getUserHash() {
	return userMap;
}
function refreshCache() {
	nameCache();
}
function setName(pid, name) {
	if (!pid || !name) {
		return;
	}
	this.userMap.delete(pid);
	this.userMap.set(pid, name.replace(/[\u{0080}-\u{FFFF}]/gu, '').replace(/\u202e/g, ''));
}

function updateCommunityHash(community) {
	if (!community) {
		return;
	}
	for (let i = 0; i < community.title_id.length; i++) {
		communityMap.set(community.title_id[i], community.name);
		communityMap.set(community.title_id[i] + '-id', community.olive_community_id);
	}
	communityMap.set(community.olive_community_id, community.name);
}

async function resizeImage(file, width, height) {
	return new Promise(function (resolve) {
		const image = Buffer.from(file, 'base64');
		sharp(image)
			.resize({ height: height, width: width })
			.toBuffer()
			.then((data) => {
				resolve(data);
			}).catch(err => console.error(err));
	});
}

async function getTGAFromPNG(image) {
	const pngData = await imagePixels(Buffer.from(image));
	const tga = TGA.createTgaBuffer(pngData.width, pngData.height, pngData.data);
	let output;
	try {
		output = pako.deflate(tga, { level: 6 });
	} catch (err) {
		console.error(err);
	}
	return new Buffer(output).toString('base64').trim();
}

function createBMPTgaBuffer(width, height, pixels, dontFlipY) {
	const buffer = Buffer.alloc(18 + pixels.length);
	// write header
	buffer.writeInt8(0, 0);
	buffer.writeInt8(0, 1);
	buffer.writeInt8(2, 2);
	buffer.writeInt16LE(0, 3);
	buffer.writeInt16LE(0, 5);
	buffer.writeInt8(0, 7);
	buffer.writeInt16LE(0, 8);
	buffer.writeInt16LE(0, 10);
	buffer.writeInt16LE(width, 12);
	buffer.writeInt16LE(height, 14);
	buffer.writeInt8(32, 16);
	buffer.writeInt8(8, 17);

	let offset = 18;
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const idx = ((dontFlipY ? i : height - i - 1) * width + j) * 4;
			buffer.writeUInt8(pixels[idx + 1], offset++); // b
			buffer.writeUInt8(pixels[idx + 2], offset++); // g
			buffer.writeUInt8(pixels[idx + 3], offset++); // r
			buffer.writeUInt8(255, offset++); // a
		}
	}

	return buffer;
}
function processLanguage(paramPackData) {
	if (!paramPackData) {
		return translations.EN;
	}
	switch (paramPackData.language_id) {
		case '0':
			return translations.JA;
		case '1':
			return translations.EN;
		case '2':
			return translations.FR;
		case '3':
			return translations.DE;
		case '4':
			return translations.IT;
		case '5':
			return translations.ES;
		case '6':
			return translations.ZH;
		case '7':
			return translations.KO;
		case '8':
			return translations.NL;
		case '9':
			return translations.PT;
		case '10':
			return translations.RU;
		case '11':
			return translations.ZH;
		default:
			return translations.EN;
	}
}
async function uploadCDNAsset(key, data, acl) {
	const awsPutParams = new PutObjectCommand({
		Body: data,
		Key: key,
		Bucket: config.aws.bucket,
		ACL: acl
	});
	try {
		await s3.send(awsPutParams);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}
async function newNotification(notification) {
	const now = new Date();
	if (notification.type === 'follow') {
		// { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
		let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID });
		if (existingNotification) {
			existingNotification.lastUpdated = now;
			existingNotification.read = false;
			return await existingNotification.save();
		}
		const last60min = new Date(now.getTime() - 60 * 60 * 1000);
		existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'follow', lastUpdated: { $gte: last60min } });
		if (existingNotification) {
			existingNotification.users.push({
				user: notification.objectID,
				timeStamp: now
			});
			existingNotification.lastUpdated = now;
			existingNotification.link = notification.link;
			existingNotification.objectID = notification.objectID;
			existingNotification.read = false;
			return await existingNotification.save();
		} else {
			const newNotification = new NOTIFICATION({
				pid: notification.pid,
				type: notification.type,
				users: [{
					user: notification.objectID,
					timestamp: now
				}],
				link: notification.link,
				objectID: notification.objectID,
				read: false,
				lastUpdated: now
			});
			await newNotification.save();
		}
	} else if (notification.type == 'notice') {
		const newNotification = new NOTIFICATION({
			pid: notification.pid,
			type: notification.type,
			text: notification.text,
			image: notification.image,
			link: notification.link,
			read: false,
			lastUpdated: now
		});
		await newNotification.save();
	}
	/* else if(notification.type === 'yeah') {
		// { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
		let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID })
		if(existingNotification) {
			existingNotification.lastUpdated = new Date();
			return await existingNotification.save();
		}
		existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'yeah' });
		if(existingNotification) {
			existingNotification.users.push({
				user: notification.objectID,
				timeStamp: new Date()
			});
			existingNotification.lastUpdated = new Date();
			existingNotification.link = notification.link;
			existingNotification.objectID = notification.objectID;
			return await existingNotification.save();
		}
		else {
			let newNotification = new NOTIFICATION({
				pid: notification.pid,
				type: notification.type,
				users: [{
					user: notification.objectID,
					timestamp: new Date()
				}],
				link: notification.link,
				objectID: notification.objectID,
				read: false,
				lastUpdated: new Date()
			});
			await newNotification.save();
		}
	} */
}
async function getFriends(pid) {
	try {
		const pids = await friendsClient.getUserFriendPIDs({
			pid: pid
		}, {
			metadata: grpc.Metadata({
				'X-API-Key': friendsKey
			})
		});
		return pids.pids;
	} catch (ignored) {
		return [];
	}
}
async function getFriendRequests(pid) {
	try {
		const requests = await friendsClient.getUserFriendRequestsIncoming({
			pid: pid
		}, {
			metadata: grpc.Metadata({
				'X-API-Key': friendsKey
			})
		});
		return requests.friendRequests;
	} catch (ignore) {
		return [];
	}
}
async function login(username, password) {
	return await apiClient.login({
		username: username,
		password: password,
		grantType: 'password'
	}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey
		})
	});
}
async function refreshLogin(refreshToken) {
	return await apiClient.login({
		refreshToken: refreshToken
	}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey
		})
	});
}
async function getUserDataFromToken(token) {
	return apiClient.getUserData({}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey,
			'X-Token': token
		})
	});
}
async function getUserDataFromPid(pid) {
	return accountClient.getUserData({
		pid: pid
	}, {
		metadata: grpc.Metadata({
			'X-API-Key': apiKey
		})
	});
}
async function getPid(token) {
	const user = await this.getUserDataFromToken(token);
	return user.pid;
}
module.exports = {
	decodeParamPack,
	processServiceToken,
	decryptToken,
	unpackToken,
	processPainting,
	nintendoPasswordHash,
	getCommunityHash,
	getUserHash,
	refreshCache,
	setName,
	updateCommunityHash,
	resizeImage,
	getTGAFromPNG,
	createBMPTgaBuffer,
	processLanguage,
	uploadCDNAsset,
	newNotification,
	getFriends,
	getFriendRequests,
	login,
	refreshLogin,
	getUserDataFromToken,
	getUserDataFromPid,
	getPid,
	create_user,
	INVALID_POST_BODY_REGEX
};
