sendMessage // DEPENDENCIES
var similarity = require("string-similarity");
var slackUtil = require("../util/slack.js");
var apiai = require("../util/apiai.js");
var cleverbot = require("../util/cleverbot.js");
var bigLittleContestLogic = require("./BigLittleContest.js");

// CONSTANTS
const SLACK_BOT_CHANNEL = process.env.SLACK_CHANNEL;
const SLACK_BOT_TS_HIT_LENGTH = 1000;
const IVP_ID = process.env.SLACK_IVP_ID;
const newLineStr = "\r\n";
const STRING_SIMILARITY_RATIO_THRESH = .7;
const tsHits = [];
const users = slackUtil.users;
const channels = slackUtil.channels;
const sendMessage = slackUtil.sendMessage;

// PROTOTYPES
if (!Promise.prototype.spread) {
  Promise.prototype.spread = function(fn) {
    return this.then(function(args) {
      return Promise.all(args);
    }).then(function(args) {
      return fn.apply(this, args);
    });
  };
}

// HELPERS
function _assertTextValid() {
  if (!text.includes(" "))
    return Promise.reject(new Error("parameter error: needs space: " + text));
  var token = text.split(" ");
  if (token.length == 0 || token.length > 3)
    return Promise.reject(new Error("parameter error: needs 3 tokens: " +
      text));
  var name = token[0].trim();
  var operator = token[1].trim();
  var value = token[2].trim();
  if (operator != "+=" && operator != "-=" && operator != "=")
    return Promise.reject(new Error("parameter error: bad operator: " +
      operator));
  value = parseInt(value);
  if (Number.isNaN(value))
    return Promise.reject(new Error("parameter error: bad value: " + value));
  return Promise.resolve([name, operator, value]);
}

function _doLeaderBoard() {
  var p = bigLittleContestLogic.get().then(function(leaderboard) {
    var result = "";
    var place = 1;
    leaderboard.forEach(function(item) {
      result += place + ". " + item.name + " :: " + item.points +
        " points " + newLineStr;
      place += 1;
    });
    return result;
  });
  sendMessage(p, SLACK_BOT_CHANNEL, true);
}

function _doPointChange(text) {
  var name = "";
  var operator = "";
  var value = 0;
  var pair = "";
  return _assertTextValid(text).spread(function(namee, operatorr, valuee) {
    name = namee;
    operator = operatorr;
    value = valuee;
    return bigLittleContestLogic.get();
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
    return bigLittleContestLogic.set(leaderboard);
  }).then(function() {
    if (operator == "+=") return pair + " got " + value + " points";
    if (operator == "-=") return pair + " lost " + value + " points";
    return pair + " has " + value + " points";
  });
  return sendMessage(p, SLACK_BOT_CHANNEL, true);
}

function _doChat(message, str, isChannel) {
  return apiai.chat(message).then(function(res) {
    if (!res.result || res.result.action == "input.unknown")
      return cleverbot.send(message);
    if (res.result && res.result.fulfillment && res.result.fulfillment.speech)
      return res.result.fulfillment.speech;
    return "Sorry, I would be too savage, if I responded to that :p";
  });
  return sendMessage(p, str, isChannel);
}

function _onMessage(data) {
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
      sendMessage(Promise.resolve("Bruh, only IVP can assign points"),
        SLACK_BOT_CHANNEL, true);
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
      sendMessage(Promise.resolve("Dammit Levi, just move back to Kansas"),
        SLACK_BOT_CHANNEL,
        true);
    }
  }
}

// METHODS
function listen() {
  slackUtil.listen(_onMessage);
}

// EXPORTS
module.exports.listen = listen;
