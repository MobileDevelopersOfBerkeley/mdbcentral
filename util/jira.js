// DEPENDENCIES
const JiraApi = require("jira-client");
const util = require("./util.js");

// INITIALIZE
var jira = new JiraApi({
  protocol: 'https',
  host: process.env.JIRA_HOST,
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_PASSWORD,
  apiVersion: '2',
  strictSSL: true
});

// CONSTANTS
const DAYS_AHEAD = 2;
const FIND_ISSUE_TIMEOUT = 60 * 1000;
const jql = "duedate <= " + DAYS_AHEAD + "d AND status != Done";

// HELPERS
function _formatTask(task) {
  var assignee = task.fields.assignee;
  var duedate = task.fields.duedate;
  var status = task.fields.status.name;
  var recipient = "Everyone";
  if (assignee && assignee.displayName)
    recipient = assignee.displayName;
  return {
    id: task.key,
    info: task.fields.summary,
    done: status == "Done",
    dueDate: duedate != null ? new Date(duedate) : null,
    recipient: recipient
  }
}

function _formatTasks(tasks) {
  var today = new Date();
  return tasks.filter(function(task) {
    return task.dueDate != null && !task.done;
  }).map(function(task) {
    task.daysApart = util.daysApart(today, task.dueDate);
    return task;
  });
}

function _getTask(taskId) {
  var p = jira.findIssue(taskId).then(_formatTask);
  return util.timeoutPromise(p, FIND_ISSUE_TIMEOUT).catch(function(error) {
    return null;
  });
}

function _getTaskKeys() {
  return jira.searchJira(jql, {}).then(function(x) {
    if (x.total < x.maxResults) return x;
    return jira.searchJira(jql, {
      maxResults: x.total
    });
  }).then(function(data) {
    var tasks = data.issues;
    return tasks.map(function(task) {
      return task.key;
    });
  });
}

function _getTasksByKeys(keys) {
  var tasks = [];
  return util.sequentialChainPromises(keys.map(function(key) {
    return function() {
      return _getTask(key).then(function(task) {
        if (task) tasks.push(task);
      });
    }
  })).then(function() {
    return tasks;
  });
}

// METHODS
function getTasks() {
  return _getTaskKeys().then(_getTasksByKeys).then(_formatTasks);
}

// EXPORTS
module.exports.getTasks = getTasks;
