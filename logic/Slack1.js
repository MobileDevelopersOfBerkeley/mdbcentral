// DEPENDENCIES
var similarity = require("string-similarity");
var bot1 = require("../util/slack.js").bot1;
var apiai = require("../util/apiai.js");
var util = require("../util/util.js");
var cleverbot = require("../util/cleverbot.js");
var bigLittleContestLogic = require("./BigLittleContest.js");
var eventsLogic = require("./Events.js");

// CONSTANTS
const SLACK_BOT_CHANNEL1 = process.env.SLACK_BOT1_CHANNEL1;
const SLACK_BOT_CHANNEL2 = process.env.SLACK_BOT1_CHANNEL2;
const SLACK_BOT_CHANNEL3 = process.env.SLACK_BOT1_CHANNEL3;
const SLACK_BOT_TS_HIT_LENGTH = 1000;
const IVP_ID = process.env.SLACK_IVP_ID;
const newLineStr = "\r\n";
const STRING_SIMILARITY_RATIO_THRESH = .7;
const DAYS_AHEAD = 1;
const REMIND_NON_ATTENDANCE_EVENTS = true;

// GLOBALS
var tsHits = [];
var users = {};
var channels = {};

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
  bigLittleContestLogic.get({sorted: true}).then(function(leaderboard) {
    var result = "";
    var place = 1;
    leaderboard.forEach(function(item) {
      result += place + ". " + item.name + " :: " + item.points +
        " points " + newLineStr;
      place += 1;
    });
    bot1.sendToChannel(SLACK_BOT_CHANNEL1, result);
  });
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
    var message = pair + " has " + value + " points";
    bot1.sendToChannel(SLACK_BOT_CHANNEL1, message);
  });
}

function _doChat(message, str, isChannel) {
  if (isChannel && str != SLACK_BOT_CHANNEL2) {
    bot1.sendToChannel(str, "Sorry, you can only talk to me at #" +
      SLACK_BOT_CHANNEL2);
    return;
  }
  var p = apiai.chat(message).then(function(res) {
    if (!res.result || res.result.action == "input.unknown")
      return cleverbot.send(message);
    if (res.result && res.result.fulfillment && res.result.fulfillment.speech)
      return res.result.fulfillment.speech;
    return "Sorry, I would be too savage, if I responded to that :p";
  });
  if (isChannel)
    bot1.sendToChannel(str, message);
  else
    bot1.sendToUser(str, message);
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
      bot1.sendToChannel(SLACK_BOT_CHANNEL1, "Bruh, only IVP can assign points");
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

// METHODS
function listen(successCb, errorCb) {
  bot1.start().then(function() {
    users = bot1.getUsers();
    channels = bot1.getChannels();
    bot1.setMessageFn(_onMessage);
  }).then(function(c) {
    successCb();
  }).catch(function(error) {
    errorCb();
  });
}

function sendReminders() {
  return eventsLogic.getAll().then(function(events) {
    var today = new Date();
    if (REMIND_NON_ATTENDANCE_EVENTS !== true) {
      events = events.filter(function(event) {
        return event.attendance === true;
      });
    }
    return Promise.all(events.map(function(event) {
      var d = new Date();
      d.setTime(event.timestamp);
      event._daysApart = util.daysApart(today, d);
      return event;
    }).filter(function(event) {
      return event._daysApart <= DAYS_AHEAD && event._daysApart >= 0;
    }).map(function(event) {
      return bot1.sendToChannel(
        SLACK_BOT_CHANNEL3,
        "@channel *" + event.title +
        "* is coming up in " + event._daysApart + " days"
      )
    }));
  });
}

// EXPORTS
module.exports.listen = listen;
module.exports.sendReminders = sendReminders;
