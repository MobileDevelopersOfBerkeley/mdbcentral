// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");
var util = require("../util/util.js");

// CONSTANTS
const SLACK_BOT_TS_HIT_LENGTH = 1000;
const SLACK_CHANNEL = process.env.SLACK_BOT2_CHANNEL1;
const DAYS_AHEAD = 3;
const TS_INTERVAL = 1000 * 60 * 60 * 24;

// HELPERS
function _sendReminders() {
  return jira.getTasks().then(function(tasks) {
    var today = new Date();
    tasks.filter(function(task) {
      var date = task.dueDate;
      return date.getDate() - today.getDate() <= DAYS_AHEAD &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear();
    }).forEach(function(task) {
      bot2.sendToChannel(
        SLACK_CHANNEL,
        "*" + task.recipient + "* you have to finish task *" +
        task.id + "* in *" + util.dayDiff(today, task.dueDate) +
        " days*: " + task.info
      )
    });
  });
}

// METHODS
function listen(successCb, errorCb) {
  bot2.start().then(function() {
    setInterval(_sendReminders, TS_INTERVAL);
  }).then(function(c) {
    successCb();
  }).catch(function(error) {
    errorCb();
  });
}

// EXPORTS
module.exports.listen = listen;
