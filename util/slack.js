// DEPENDENCIES
var SlackBot = require('slackbots');
const config = require("../config.json");

// CONSTANTS
const SLACK_BOT_1_TOKEN = process.env.SLACK_TOKEN1;
const SLACK_BOT_2_TOKEN = process.env.SLACK_TOKEN2;
const SLACK_BOT_IMAGE = config.slackBotImage;
const SLACK_BOT_NAME = config.slackBotName;
const PARAMS = {
	slackbot: true,
	icon_url: SLACK_BOT_IMAGE
};

// HELPERS
function _getObjs(bot, data, dataKey, fnName, objName) {
	return bot[fnName]().then(function(dat) {
		var objs = {};
		for (var i = 0; i < dat[objName].length; i++) {
			var obj = dat[objName][i];
			objs[obj.id] = obj;
		}
		data[dataKey] = objs;
	});
}

function _getChannels(bot, data) {
	return _getObjs(bot, data, "channels", "getChannels", "channels");
}

function _getUsers(bot, data) {
	return _getObjs(bot, data, "users", "getUsers", "members");
}

function _start(bot, data) {
	return new Promise(function(resolve, reject) {
		bot.on('start', function() {
			resolve(Promise.all([
				_getChannels(bot, data),
				_getUsers(bot, data)
			]));
		});
	});
}

function _Bot(token) {
	var bot = new SlackBot({
		token: token,
		name: SLACK_BOT_NAME
	});
	var data = {};
	return {
		start: function() {
			return _start(bot, data);
		},
		getUsers: function() {
			return data.users;
		},
		getChannels: function() {
			return data.channels;
		},
		setMessageFn: function(fn) {
			bot.on('message', fn);
		},
		sendToUser: function(user, message) {
			return bot.postMessageToUser(user, message, PARAMS);
		},
		sendToChannel: function(channel, message) {
			return bot.postMessageToChannel(channel, message, PARAMS);
		}
	}
}

// EXPORTS
module.exports.bot1 = _Bot(SLACK_BOT_1_TOKEN);
module.exports.bot2 = _Bot(SLACK_BOT_2_TOKEN);
