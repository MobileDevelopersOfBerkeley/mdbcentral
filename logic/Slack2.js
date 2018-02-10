// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");

// CONSTANTS
const SLACK_BOT_TS_HIT_LENGTH = 1000;
const SLACK_CHANNEL = process.env.SLACK_BOT2_CHANNEL1;
const DAYS_AHEAD = 1;

// GLOBALS
var tsHits = [];
var users = {};
var channels = {};
var dueDates = {};

// HELPERS
function _setTaskDueDate(taskId) {
  return jira.getTask(taskId).then(function(task) {
    // TODO: get due date from task object
    var dueDate = task.someField.someSubField;
    dueDates[taskId] = dueDate;
  });
}

function _getTaskRecipient(taskId) {
  return jira.getTask(taskId).then(function(task) {
    // TODO: return task recipient
    return task.someField.someSubField;
  });
}

function _onMessage(data) {
  if (data.user in users && tsHits.indexOf(data.ts) < 0 && data.type ==
    "message") {
    var user = users[data.user];
    var channel = channels[data.channel];
    tsHits.push(data.ts);
    if (channel != SLACK_CHANNEL) return;
    if (tsHits.length > SLACK_BOT_TS_HIT_LENGTH) tsHits = [];
    // TODO: filter only issue updates
    // TODO: get the task id
    var taskId;
    _setTaskDueDate(taskId);
  }
}

function _sendReminder(taskId, dueDate) {
  return _getTaskRecipient(taskId).then(function(recipient) {
    return bot2.sendToChannel(SLACK_CHANNEL, recipient +
      " you have to finish task " + taskId);
  });
}

// JOBS
setInterval(function() {
  Object.keys(dueDates).forEach(function(taskId) {
    var dueDate = dueDates[taskId];
    var today = new Date();
    var date = new Date(dueDate);
    if (date.getDate() - today.getDate() <= DAYS_AHEAD && date.getMonth() ==
      today.getMonth() && date.getFullYear() == today.getFullYear()) {
      _sendReminder(taskId, dueDate);
    }
  });
}, 1000 * 60 * 60 * 24);

// METHODS
function listen(successCb, errorCb) {
  bot2.start().then(function() {
    users = bot2.getUsers();
    channels = bot2.getChannels();
    bot2.setMessageFn(_onMessage);
  }).then(function(c) {
    successCb();
  }).catch(function(error) {
    errorCb();
  });
}

// EXPORTS
module.exports.listen = listen;
