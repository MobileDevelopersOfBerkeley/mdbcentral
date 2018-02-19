// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");
var util = require("../util/util.js");

// CONSTANTS
const SLACK_CHANNEL = process.env.SLACK_BOT2_CHANNEL1;
const DAYS_AHEAD = 2;

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
    var today = new Date();
    return Promise.all(tasks.map(function(task) {
      task._daysApart = util.daysApart(today, task.dueDate);
      return task;
    }).filter(function(task) {
      return task._daysApart <= DAYS_AHEAD;
    }).map(function(task) {
      return bot2.sendToChannel(
        SLACK_CHANNEL,
        "*" + task.recipient + "* you have to finish task *" +
        task.id + "* in *" + task._daysApart +
        " days*: " + task.info
      )
    }));
  });
}

// EXPORTS
module.exports.listen = listen;
module.exports.sendReminders = sendReminders;
