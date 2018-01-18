// DEPENDENCIES
var SlackBot = require('slackbots');
const config = require("../config.json");

// CONSTANTS
const SLACK_BOT_TOKEN = process.env.SLACK_TOKEN;
const SLACK_BOT_IMAGE = config.slackBotImage;
const POST_HELLO_MESSAGE = true;
const SLACK_BOT_HELLO_MESSAGE = config.slackBotHello;
const SLACK_BOT_NAME = config.slackBotName;
const ERROR_MESSAGE = config.slackBotErrorMessage;

// SETUP
var bot = null;
var params = {
	slackbot: true,
	icon_url: SLACK_BOT_IMAGE
};
var users = {};
var channels = {};

// HELPER
function _start() {
	bot.getChannels().then(function(data) {
		for (var i = 0; i < data.channels.length; i++) {
			var channel = data.channels[i];
			channels[channel.id] = channel;
		}
		return bot.getUsers();
	}).then(function(data) {
		for (var i = 0; i < data.members.length; i++) {
			var user = data.members[i];
			users[user.id] = user;
		}
		if (POST_HELLO_MESSAGE === true) {
			return _postMessage(Promise.resolve(SLACK_BOT_HELLO_MESSAGE), "general",
				true);
		}
	});
}

function _init(onMessage) {
	if (!bot) {
		bot = new SlackBot({
			token: SLACK_BOT_TOKEN,
			name: SLACK_BOT_NAME
		});
		bot.on('start', _start);
		if (onMessage)
			bot.on('message', onMessage(_postMessage));
	}
}

function _post(str, value, isChannel) {
	if (isChannel)
		return bot.postMessageToChannel(str, value, params);
	return bot.postMessageToUser(str, value, params);
}

function _genErrorCallback(str, isChannel) {
	function errorCallback(error) {
		return _post(str, ERROR_MESSAGE, isChannel);
	}
	return errorCallback
}

function _genSuccessCallback(str, isChannel) {
	function successCallback(x) {
		return _post(str, x, isChannel);
	}
	return successCallback;
}

function _postMessage(p, str, isChannel) {
	return p.then(_genSuccessCallback(str, isChannel)).catch(_genErrorCallback(str,
		isChannel));
}

// METHODS
function listen(onMessage) {
	console.log("slack bot listening");
	_init(onMessage);
	return Promise.resolve(true);
}

function send(channel, message) {
	_init();
	return bot.postMessageToChannel(channel, message, params);
}

// EXPORTS
module.exports.users = users;
module.exports.channels = channels;
module.exports.listen = listen;
module.exports.send = send;
