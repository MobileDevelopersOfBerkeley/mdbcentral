// DEPENDENCIES
const JiraApi = require("jira-client");

// INITIALIZE
var jira = new JiraApi({
  protocol: 'https',
  host: process.env.JIRA_HOST,
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_PASSWORD,
  apiVersion: '2',
  strictSSL: true
});

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

function _getTask(taskId) {
  return jira.findIssue(taskId).then(_formatTask);
}

function _getTaskKeys() {
  return jira.searchJira("", {}).then(function(x) {
    return jira.searchJira("", {
      maxResults: x.total
    });
  }).then(function(data) {
    var tasks = data.issues;
    return tasks.map(function(task) {
      return task.key;
    });
  });
}

// METHODS
function getTasks() {
  return _getTaskKeys().then(function(keys) {
    return Promise.all(keys.map(function(key) {
      return _getTask(key);
    }));
  }).then(function(tasks) {
    var today = new Date();
    return tasks.filter(function(task) {
      return task.dueDate != null && !task.done;
    });
  });
}

// EXPORTS
module.exports.getTasks = getTasks;
