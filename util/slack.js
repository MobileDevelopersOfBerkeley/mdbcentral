// DEPENDENCIES
var SlackBot = require('slackbots');
var similarity = require("string-similarity");
var apiai = require("./apiai.js");
var cleverbot = require("./cleverbot.js");
var config = require("../config.json");

// CONSTANTS
const SLACK_BOT_HELLO_MESSAGE = config.slackBotHello;
const SLACK_BOT_TOKEN = config.slackBotToken;
const SLACK_BOT_NAME = config.slackBotName;
const SLACK_BOT_CHANNEL = config.slackBotChannel;
const SLACK_BOT_IMAGE = config.slackBotImage;
const SLACK_BOT_TS_HIT_LENGTH = 1000;
const newLineStr = "\r\n";
const IVP_ID = config.ivpID;
const STRING_SIMILARITY_RATIO_THRESH = .7;
const POST_HELLO_MESSAGE = false;
const ERROR_MESSAGE = config.slackBotErrorMessage;

// OVERRIDES
if (!Promise.prototype.spread) {
	Promise.prototype.spread = function(fn) {
		return this.then(function(args) {
			return Promise.all(args);
		}).then(function(args) {
			return fn.apply(this, args);
		});
	};
}

// SETUP
var bot = null;
var params = {
	slackbot: true,
	icon_url: SLACK_BOT_IMAGE
};
var users = {};
var tsHits = [];
var channels = {};

// HELPER
function _init() {
	if (!bot) {
		bot = new SlackBot({
			token: SLACK_BOT_TOKEN,
			name: SLACK_BOT_NAME
		});
		bot.on('start', _start);
		bot.on('message', _message);
	}
}

function _post(str, value, isChannel) {
	if (isChannel)
		return bot.postMessageToChannel(str, value, params);
	return bot.postMessageToUser(str, value, params);
}

function _genErrorCallback(str, isChannel) {
	function errorCallback(error) {
		console.error(error.toString());
		return _post(str, ERROR_MESSAGE, isChannel);
	}
	return errorCallback
}

function _genSuccessCallback(str, isChannel) {
	function successCallback(x) {
		console.log(x);
		return _post(str, x, isChannel);
	}
	return successCallback;
}

function _wrapPromise(p, str, isChannel) {
	return p.then(_genSuccessCallback(str, isChannel)).catch(_genErrorCallback(str,
		isChannel));
}

function _postMessage(message, str, isChannel) {
	var p = Promise.resolve(message);
	return _wrapPromise(p, str, isChannel);
}

function _doLeaderBoard() {
	console.log(">> leaderboard @ " + new Date().toString());
	var p = firebase_logic.getLeaderBoard().then(function(leaderboard) {
		var result = "";
		var place = 1;
		leaderboard.forEach(function(item) {
			result += place + ". " + item.name + " :: " + item.points + " points " +
				newLineStr;
			place += 1;
		});
		return result;
	});
	_wrapPromise(p, SLACK_BOT_CHANNEL, true);
}

function _doPointChange(text) {
	function assertTextValid() {
		if (!text.includes(" "))
			return Promise.reject(new Error("parameter error: needs space: " + text));
		var token = text.split(" ");
		if (token.length == 0 || token.length > 3)
			return Promise.reject(new Error("parameter error: needs 3 tokens: " + text));
		var name = token[0].trim();
		var operator = token[1].trim();
		var value = token[2].trim();
		if (operator != "+=" && operator != "-=" && operator != "=")
			return Promise.reject(new Error("parameter error: bad operator: " + operator));
		value = parseInt(value);
		if (Number.isNaN(value))
			return Promise.reject(new Error("parameter error: bad value: " + value));
		return Promise.resolve([name, operator, value]);
	}
	console.log(">> point change @ " + new Date().toString());
	var name = "";
	var operator = "";
	var value = 0;
	var pair = "";
	var p = assertTextValid(text).spread(function(namee, operatorr, valuee) {
		name = namee;
		operator = operatorr;
		value = valuee;
		return firebase_logic.getLeaderBoard();
	}).then(function(leaderboard) {
		var bigNames = [];
		var lilNames = [];
		leaderboard.forEach(function(item) {
			if (item.name.includes("/")) {
				var token = item.name.split("/");
				if (token.length == 2) {
					var bigName = token[0].trim();
					var lilName = token[1].trim();
					bigNames.push(bigName);
					lilNames.push(lilName);
				}
			}
		});
		if (bigNames.length == 0 && lilNames.length == 0)
			return Promise.reject(new Error("no bigs or littles to parse"));
		var bigNameMatch = similarity.findBestMatch(name, bigNames).bestMatch;
		var lilNameMatch = similarity.findBestMatch(name, lilNames).bestMatch;
		var nameMatch = bigNameMatch;
		if (lilNameMatch.rating > bigNameMatch.rating) nameMatch = lilNameMatch;
		if (nameMatch.rating < STRING_SIMILARITY_RATIO_THRESH)
			return Promise.reject(new Error(
				"no bigs or littles with good enough similarity"));
		for (var key in leaderboard) {
			var item = leaderboard[key];
			if (item.name.includes("/")) {
				var token = item.name.split("/");
				if (token.length == 2) {
					var bigName = token[0].trim();
					var lilName = token[1].trim();
					if (bigName == nameMatch.target || lilName == nameMatch.target) {
						if (operator == "+=") item.points += value;
						else if (operator == "-=") item.points -= value;
						else item.points = value;
						pair = item.name;
						break;
					}
				}
			}
		}
		return firebase_logic.setLeaderBoard(leaderboard);
	}).then(function() {
		if (operator == "+=") return pair + " got " + value + " points";
		if (operator == "-=") return pair + " lost " + value + " points";
		return pair + " has " + value + " points";
	});
	_wrapPromise(p, SLACK_BOT_CHANNEL, true);
}

function _doChat(message, str, isChannel) {
	console.log(">> chat @ " + new Date().toString());
	var p = apiai.chat(message).then(function(res) {
		if (!res.result || res.result.action == "input.unknown")
			return cleverbot.send(message);
		if (res.result && res.result.fulfillment && res.result.fulfillment.speech)
			return res.result.fulfillment.speech;
		return "Sorry, I would be too savage, if I responded to that :p";
	});
	_wrapPromise(p, str, isChannel);
}

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
			return _postMessage(SLACK_BOT_HELLO_MESSAGE, "general", true);
		}
	});
}

function _message(data) {
	if (data.user in users && tsHits.indexOf(data.ts) < 0 && data.type ==
		"message") {
		var user = users[data.user];
		var channel = channels[data.channel];
		tsHits.push(data.ts);
		if (tsHits.length > SLACK_BOT_TS_HIT_LENGTH) tsHits = [];
		data.text = data.text.trim().toLowerCase();
		if (data.text == "leaderboard") {
			_doLeaderBoard();
		} else if (data.user == IVP_ID && data.text.startsWith("assign")) {
			var text = data.text.replace("assign", "").trim();
			_doPointChange(text);
		} else if (data.user != IVP_ID && data.text.startsWith("assign")) {
			_postMessage("Bruh, only IVP can assign points", SLACK_BOT_CHANNEL, true);
		} else if (data.text.startsWith("mdbot") || data.text.startsWith("mdbbot") ||
			data.text.startsWith("mdb bot")) {
			var message = data.text.trim();
			if (message.startsWith("mdbot"))
				message = message.replace("mdbot", "").trim();
			else if (message.startsWith("mdbbot"))
				message = message.replace("mdbbot", "").trim();
			else if (message.startsWith("mdb bot"))
				message = message.replace("mdb bot", "").trim();

			var isChannel = channel != null && channel.name != null;

			var str = "";
			if (!isChannel) str = user.name;
			else str = channel.name;

			_doChat(message, str, isChannel);
		} else if (data.text == "leviboard") {
			_postMessage("Dammit Levi, just move back to Kansas", SLACK_BOT_CHANNEL,
				true);
		}
	}
}

module.exports.listen = function() {
	console.log("listening");
	_init();
	return Promise.resolve(true);
}

module.exports.send = function(channel, message) {
	_init();
	return bot.postMessageToChannel(channel, message, params);
}
