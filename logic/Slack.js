// DEPENDENCIES
var similarity = require("string-similarity");
var slackUtil = require("../util/slack.js");
var apiai = require("../util/apiai.js");
var cleverbot = require("../util/cleverbot.js");
var bigLittleContestLogic = require("./BigLittleContest.js");
var jira = require("jira");

// TODO: setup jira module with api keys

// CONSTANTS
const SLACK_BOT_CHANNEL1 = process.env.SLACK_CHANNEL1;
const SLACK_BOT_CHANNEL2 = process.env.SLACK_CHANNEL2;
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
  sendMessage(p, SLACK_BOT_CHANNEL1, true);
}

function _doPointChange(text) {
  var name = "";
  var operator = "";
  var value = 0;
  var pair = "";
  var p = _assertTextValid(text).spread(function(namee, operatorr, valuee) {
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
  sendMessage(p, SLACK_BOT_CHANNEL1, true);
}

function _doChat(message, str, isChannel) {
  if (isChannel && str != SLACK_BOT_CHANNEL2) {
    sendMessage(Promise.resolve("Sorry, you can only talk to me at #" +
      SLACK_BOT_CHANNEL2), str, true);
    return;
  }
  var p = apiai.chat(message).then(function(res) {
    if (!res.result || res.result.action == "input.unknown")
      return cleverbot.send(message);
    if (res.result && res.result.fulfillment && res.result.fulfillment.speech)
      return res.result.fulfillment.speech;
    return "Sorry, I would be too savage, if I responded to that :p";
  });
  sendMessage(p, str, isChannel);
}

function _onMessage(data) {
  if (data.user in users && tsHits.indexOf(data.ts) < 0 && data.type ==
    "message") {
    var user = users[data.user];
    var channel = channels[data.channel];
    tsHits.push(data.ts);
    if (tsHits.length > SLACK_BOT_TS_HIT_LENGTH) tsHits = [];
    data.text = data.text.trim().toLowerCase();
    if (data.type == "???") {
      _onJIRATask(data);
    } else if (data.text == "leaderboard") {
      _doLeaderBoard();
    } else if (data.user == IVP_ID && data.text.startsWith("assign")) {
      var text = data.text.replace("assign", "").trim();
      _doPointChange(text);
    } else if (data.user != IVP_ID && data.text.startsWith("assign")) {
      sendMessage(Promise.resolve("Bruh, only IVP can assign points"),
        SLACK_BOT_CHANNEL1, true);
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
    }
  }
}

var dueDates = {}; // task-id to due date string

function _onJIRATask(data) {
  // TODO:
  // https://www.npmjs.com/package/jira
  // parse the task
  // get the task id
  var taskId;
  // get the due date
  var dueDate;
  dueDates[taskId] = dueDate;
}

setInterval(function() {
  Object.keys(dueDates).forEach(function(taskId) {
    var dueDate = dueDates[taskId];
    var today = new Date();
    var date = new Date(dueDate);
    if (date.getDate() - today.getDate() <= 1 && date.getMonth() ==
      today.getMonth() && date.getFullYear() == today.getFullYear()) {
      sendMessage(Promise.resolve("SHREYA IS REMDING YOU TO DO task: " +
          taskId),
        "#jira", true);
    }
  });
}, 1000 * 60 * 60 * 24);

// METHODS
function listen() {
  slackUtil.listen(_onMessage);
}

// EXPORTS
module.exports.listen = listen;
