const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const fs = require('fs-extra');
const database = require('./database');
const logger = require('./logger');
const grpc = require('nice-grpc');
const config = require('../config.json');
const { SETTINGS } = require('./models/settings');
const { CONTENT } = require('./models/content');
const { NOTIFICATION } = require('./models/notifications');
const { COMMUNITY } = require('./models/communities');
const { AccountDefinition } = require('pretendo-grpc/dist/account/account_service');
const { FriendsDefinition } = require('pretendo-grpc/dist/friends/friends_service');
const { APIDefinition } = require('pretendo-grpc/dist/api/api_service');
const translations = require('./translations')
const HashMap = require('hashmap');
const TGA = require('tga');
const pako = require('pako');
const PNG = require('pngjs').PNG;
const bmp = require("bmp-js");
const aws = require('aws-sdk');
const crc32 = require('crc/crc32');
let communityMap = new HashMap();
let userMap = new HashMap();

const { ip: friendsIP, port: friendsPort, api_key: friendsKey } = config.grpc.friends;
const friendsChannel = grpc.createChannel(`${friendsIP}:${friendsPort}`);
const friendsClient = grpc.createClient(FriendsDefinition, friendsChannel);

const { ip: apiIP, port: apiPort, api_key: apiKey } = config.grpc.account;
const apiChannel = grpc.createChannel(`${apiIP}:${apiPort}`);
const apiClient = grpc.createClient(APIDefinition, apiChannel);

const accountChannel = grpc.createChannel(`${apiIP}:${apiPort}`);
const accountClient = grpc.createClient(AccountDefinition, accountChannel);

const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: config.aws.spaces.key,
    secretAccessKey: config.aws.spaces.secret
});

nameCache();

function nameCache() {
    database.connect().then(async e => {
        let communities = await COMMUNITY.find();
        if(communities !== null) {
            for(let i = 0; i < communities.length; i++ ) {
                if(communities[i].title_id !== null) {
                    for(let j = 0; j < communities[i].title_id.length; j++) {
                        communityMap.set(communities[i].title_id[j], communities[i].name);
                        communityMap.set(communities[i].title_id[j] + '-id', communities[i].olive_community_id);
                    }
                    communityMap.set(communities[i].olive_community_id, communities[i].name);
                }
            }
            logger.success('Created community index of ' + communities.length + ' communities');
        }
        let users = await database.getUsersSettings(-1);
        if(users !== null) {
            for(let i = 0; i < users.length; i++ ) {
                if(users[i].pid !== null) {
                    userMap.set(users[i].pid, users[i].screen_name.replace(/[\u{0080}-\u{FFFF}]/gu,""));
                }
            }
            logger.success('Created user index of ' + users.length + ' users')
        }

    }).catch(error => {
        logger.error(error);
    });
}

let methods = {
    create_user: async function(pid, experience, notifications) {
        const pnid = await this.getUserDataFromPid(pid);
        if(!pnid)
            return;
        let newSettings = {
            pid: pid,
            screen_name: pnid.mii.name,
            game_skill: experience,
            receive_notifications: notifications,
        }
        let newContent = {
            pid: pid
        }
        const newSettingsObj = new SETTINGS(newSettings);
        await newSettingsObj.save();

        const newContentObj = new CONTENT(newContent);
        await newContentObj.save();

        this.setName(pid, pnid.mii.name);
    },
    decodeParamPack: function (paramPack) {
        /*  Decode base64 */
        let dec = Buffer.from(paramPack, "base64").toString("ascii");
        /*  Remove starting and ending '/', split into array */
        dec = dec.slice(1, -1).split("\\");
        /*  Parameters are in the format [name, val, name, val]. Copy into out{}. */
        const out = {};
        for (let i = 0; i < dec.length; i += 2) {
            out[dec[i].trim()] = dec[i + 1].trim();
        }
        return out;
    },
    processServiceToken: function(encryptedToken) {
        try
        {
            let B64token = Buffer.from(encryptedToken, 'base64');
            let decryptedToken = this.decryptToken(B64token);
            const token = this.unpackToken(decryptedToken);
            return token.pid;
        }
        catch(e)
        {
            console.log(e)
            return null;
        }

    },
    decryptToken: function(token) {
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
    },
    unpackToken: function(token) {
        return {
            system_type: token.readUInt8(0x0),
            token_type: token.readUInt8(0x1),
            pid: token.readUInt32LE(0x2),
            expire_time: token.readBigUInt64LE(0x6),
            title_id: token.readBigUInt64LE(0xE),
            access_level: token.readInt8(0x16)
        };
    },
    processPainting: async function (painting, isTGA) {
        if (isTGA) {
            let paintingBuffer = Buffer.from(painting, 'base64');
            let output = '';
            try {
                output = pako.inflate(paintingBuffer);
            } catch (err) {
                console.error(err);
            }
            let tga;
            try {
                tga = new TGA(Buffer.from(output));
            }
            catch (e) {
                console.log(e)
                return null;
            }
            let png = new PNG({
                width: tga.width,
                height: tga.height
            });
            png.data = tga.pixels;
            return PNG.sync.write(png);
            //return `data:image/png;base64,${pngBuffer.toString('base64')}`;
        }
        else {
            let paintingBuffer = Buffer.from(painting, 'base64');
            let bitmap = bmp.decode(paintingBuffer)
            const tga = this.createBMPTgaBuffer(bitmap.width, bitmap.height, bitmap.data, false);

            let output;
            try {
                output = pako.deflate(tga, {level: 6});
            }
            catch (err) {
                console.error(err);
            }
            return new Buffer(output).toString('base64')
        }
    },
    nintendoPasswordHash: function(password, pid) {
    const pidBuffer = Buffer.alloc(4);
    pidBuffer.writeUInt32LE(pid);

    const unpacked = Buffer.concat([
        pidBuffer,
        Buffer.from('\x02\x65\x43\x46'),
        Buffer.from(password)
    ]);
        return crypto.createHash('sha256').update(unpacked).digest().toString('hex');
    },
    getCommunityHash: function() {
        return communityMap;
    },
    getUserHash: function() {
        return userMap;
    },
    refreshCache: function () {
      nameCache();
    },
    setName: function (pid, name) {
        if(!pid || !name)
            return;
        userMap.delete(pid);
        userMap.set(pid, name);
    },
    resizeImage: function (file, width, height) {
        sharp(file)
            .resize({ height: height, width: width })
            .toBuffer()
            .then(data => {
                return data;
            });
    },
    createBMPTgaBuffer: function(width, height, pixels, dontFlipY) {
    var buffer = Buffer.alloc(18 + pixels.length);
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

        var offset = 18;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var idx = ((dontFlipY ? i : height - i - 1) * width + j) * 4;
                buffer.writeUInt8(pixels[idx + 1], offset++);    // b
                buffer.writeUInt8(pixels[idx + 2], offset++);    // g
                buffer.writeUInt8(pixels[idx + 3], offset++);    // r
                buffer.writeUInt8(255, offset++);          // a
            }
        }

        return buffer;
    },
    processLanguage: function (paramPackData) {
        if(!paramPackData)
            return translations.EN;
        switch (paramPackData.language_id) {
            case '0':
                return translations.JA
            case '1':
                return translations.EN
            case '2':
                return translations.FR
            case '3':
                return translations.DE
            case '4':
                return translations.IT
            case '5':
                return translations.ES
            case '6':
                return translations.ZH
            case '7':
                return translations.KO
            case '8':
                return translations.NL
            case '9':
                return translations.PT
            case '10':
                return translations.RU
            case '11':
                return translations.ZH
            default:
                return translations.EN
        }
    },
    uploadCDNAsset: async function(bucket, key, data, acl) {
        const awsPutParams = {
            Body: data,
            Key: key,
            Bucket: bucket,
            ACL: acl
        };

        await s3.putObject(awsPutParams).promise();
    },
    newNotification: async function(notification) {
        const now = new Date();
        if(notification.type === 'follow') {
            // { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
            let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID })
            if(existingNotification) {
                existingNotification.lastUpdated = now;
                existingNotification.read = false;
                return await existingNotification.save();
            }
            const last10min = new Date(now.getTime() - 10 * 60 * 1000);
            existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'follow', lastUpdated: { $gte: last10min } });
            if(existingNotification) {
                existingNotification.users.push({
                    user: notification.objectID,
                    timeStamp: now
                });
                existingNotification.lastUpdated = now;
                existingNotification.link = notification.link;
                existingNotification.objectID = notification.objectID;
                existingNotification.read = false;
                return await existingNotification.save();
            }
            else {
                let newNotification = new NOTIFICATION({
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
        }
        /*else if(notification.type === 'yeah') {
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
        }*/
    },
    getFriends: async function(pid) {
        const pids =  await friendsClient.getUserFriendPIDs({
            pid: pid
        }, {
            metadata: grpc.Metadata({
                'X-API-Key': friendsKey
            })
        });
        return pids.pids;
    },
    getFriendRequests: async function(pid) {
        const requests = await friendsClient.getUserFriendRequestsIncoming({
            pid: pid
        }, {
            metadata: grpc.Metadata({
                'X-API-Key': friendsKey
            })
        });
        return requests.friendRequests;
    },
    login: async function(username, password) {
        return await apiClient.login({
            username: username,
            password: password,
            grantType: 'password'
        }, {
            metadata: grpc.Metadata({
                'X-API-Key': apiKey
            })
        });
    },
    getUserDataFromToken: async function(token) {
        return apiClient.getUserData({}, {
            metadata: grpc.Metadata({
                'X-API-Key': apiKey,
                'X-Token': token
            })
        });
    },
    getUserDataFromPid: async function(pid) {
      return accountClient.getUserData({
          pid: pid
      }, {
          metadata: grpc.Metadata({
              'X-API-Key': apiKey
          })
      });
    },
    getPid: async function(token) {
        const user = await this.getUserDataFromToken(token);
        return user.pid;
    }
};
exports.data = methods;
