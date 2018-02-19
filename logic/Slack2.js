// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");

// CONSTANTS
const SLACK_CHANNEL = process.env.SLACK_BOT2_CHANNEL1;

// HELPERS
function _sendTaskReminder(task) {
  var str = "*" + task.recipient + "* you have to finish task *" +
    task.id + "* in *" + task.daysApart +
    " days*: " + task.info;
  return bot2.sendToChannel(SLACK_CHANNEL, str)
}

function _sendAtChannel() {
  return bot2.sendToChannel(SLACK_CHANNEL, "@channel");
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
    var plist = [_sendAtChannel()];
    plist = plist.concat(tasks.map(_sendTaskReminder));
    return Promise.all(plist);
  });
}

// EXPORTS
module.exports.listen = listen;
module.exports.sendReminders = sendReminders;
