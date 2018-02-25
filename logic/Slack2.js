// DEPENDENCIES
var bot2 = require("../util/slack.js").bot2;
var jira = require("../util/jira.js");
var util = require("../util/util.js");
var signInLogic = require("./SignIns.js");
var eventLogic = require("./Events.js");
var memberLogic = require("./Members.js");

// CONSTANTS
const SLACK_CHANNEL1 = process.env.SLACK_BOT2_CHANNEL1;
const SLACK_CHANNEL2 = process.env.SLACK_BOT2_CHANNEL2;

// HELPERS
function _sendTaskReminder(task) {
  var str = "*" + task.recipient + "* you have to finish task *" +
    task.id + "* in *" + task.daysApart +
    " days*: " + task.info;
  return bot2.sendToChannel(SLACK_CHANNEL1, str);
}

function _sendTaskReminderSummary(tasks) {
  var future = tasks.filter(function(task) {
    return task.daysApart >= 0;
  }).length;
  var late = tasks.length - future.length;
  var str = late + " *late* tasks and " + future + " *current* tasks.";
  return bot2.sendToChannel(SLACK_CHANNEL1, str);
}

function _sendAbsenceAlert(memberId, event) {
  return memberLogic.getById({
    id: memberId
  }).then(function(member) {
    var str = "*" + member.name + "* was absent for " + event.title;
    return bot2.sendToChannel(SLACK_CHANNEL2, str);
  });
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
  var tasks;
  return jira.getTasks().then(function(x) {
    tasks = x;
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
  }).then(function() {
    return _sendTaskReminderSummary(tasks);
  });
}

function sendAbsenceAlerts() {
  return eventLogic.getByToday().catch(function(error) {
    return null;
  }).then(function(event) {
    if (!event || event.attendance !== true) return;
    var d = new Date();
    d.setTime(event.endTimestamp);
    var today = new Date();
    if (!util.sameDay(d, today)) return;
    return signInLogic.getAttendanceByEvent({
      title: event.title
    }).then(function(data) {
      return util.sequentialChainPromises(Object.keys(data)
        .map(function(member) {
          return function() {
            var aList = data[member].absences;
            if (aList.length == 0)
              return Promise.resolve(true);
            return _sendAbsenceAlert(member, aList[0]);
          }
        }));
    });
  });
}

// EXPORTS
module.exports.listen = listen;
module.exports.sendReminders = sendReminders;
module.exports.sendAbsenceAlerts = sendAbsenceAlerts;
