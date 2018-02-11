// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");
var taskLogic = require("./LeadershipTaskIds.js");

// CONSTANTS
const SLACK_BOT_TS_HIT_LENGTH = 1000;
const SLACK_CHANNEL = process.env.SLACK_BOT2_CHANNEL1;
const DAYS_AHEAD = 1;

// HELPERS
function _getTasks() {
  var tasks = [];
  return taskLogic.getAll().then(function(taskIds) {
    return Promise.all(taskIds.map(function(taskId) {
      return jira.getTask(taskId).then(function(task) {
        tasks.append(task);
      }).catch(function(error) {
        return taskLogic.remove({
          id: taskId
        });
      });
    }));
  }).then(function() {
    return tasks;
  });
}

function _onMessage(data) {
  if (data.type != "message" || data.subtype != "bot_message" ||
    !data.attachments || data.attachments.length == 0) return;
  var message = data.attachments[0];
  if (!message.title || message.title.indexOf(":") < 0) return;
  var taskId = message.title.split(":")[0];
  return taskLogic.add({
    id: taskId
  });
}

function _sendReminder(task) {
  return bot2.sendToChannel(SLACK_CHANNEL, task.recipient +
    " you have to finish task " + task.id + " by " + task.dueDate);
}

function _sendReminders() {
  _getTasks().then(function(tasks) {
    tasks.forEach(function(task) {
      var today = new Date();
      var date = new Date(task.dueDate);
      if (date.getDate() - today.getDate() <= DAYS_AHEAD && date.getMonth() ==
        today.getMonth() && date.getFullYear() == today.getFullYear()) {
        _sendReminder(taskId, dueDate);
      }
    });
  });
}

// METHODS
function listen(successCb, errorCb) {
  bot2.start().then(function() {
    bot2.setMessageFn(_onMessage);
    setInterval(_sendReminders, 1000 * 60 * 60 * 24)
  }).then(function(c) {
    successCb();
  }).catch(function(error) {
    errorCb();
  });
}

// EXPORTS
module.exports.listen = listen;
