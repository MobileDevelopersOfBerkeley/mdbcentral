// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");
var util = require("../util/util.js");
var runOnceADay = require("../util/task.js").runOnceADay;

// CONSTANTS
const SLACK_CHANNEL = process.env.SLACK_BOT2_CHANNEL1;
const DAYS_AHEAD = 3;
const HOUR_OF_DAY = 13;

// HELPERS
function _sendReminders() {
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
  }).catch(function(error) {
    return bot2.sendToUser("krishnan", error.toString());
  });
}

// METHODS
function listen(successCb, errorCb) {
  bot2.start().then(function() {
    runOnceADay(HOUR_OF_DAY, _sendReminders);
  }).then(function(c) {
    successCb();
  }).catch(function(error) {
    errorCb();
  });
}

// EXPORTS
module.exports.listen = listen;
