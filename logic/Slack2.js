// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");
var util = require("../util/util.js");

// CONSTANTS
const SLACK_CHANNEL = process.env.SLACK_BOT2_CHANNEL1;

// HELPERS
function _sendTaskReminder(task) {
  var str = "*" + task.recipient + "* you have to finish task *" +
    task.id + "* in *" + task.daysApart +
    " days*: " + task.info;
  return bot2.sendToChannel(SLACK_CHANNEL, str)
}

// METHODS
function listen(successCb, errorCb) {
  bot2.start().then(function(c) {
    successCb();
  }).catch(function(error) {
    errorCb();
  });
}

function sendReminders() {
  return jira.getTasks().then(function(tasks) {
    return util.sequentialChainPromises(tasks.sort(function(a, b) {
      if (a.daysApart > b.daysApart) return 1;
      if (a.daysApart < b.daysApart) return -1;
      return 0;
    }).sort(function(a, b) {
      if (a.recipient == "Everyone" && b.recipient != "Everyone")
        return 2;
      if (b.recipient == "Everyone" && a.recipient != "Everyone")
        return -2;
      if (a.recipient > b.recipient) return 1;
      if (a.recipient < b.recipient) return -1;
      return 0;
    }).map(function(task) {
      return function() {
        return _sendTaskReminder(task);
      }
    }));
  });
}

// EXPORTS
module.exports.listen = listen;
module.exports.sendReminders = sendReminders;
