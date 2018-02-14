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

function _getProjectKeys() {
  return jira.listProjects().then(function(data) {
    return data.map(function(d) {
      return d.key;
    });
  });
}

function _getTasksByProjectKey(key) {
  return jira.searchJira("project=\"" + key + "\"", {}).then(function(data) {
    return Promise.all(data.issues.map(function(issue) {
      return _getTask(issue.key);
    }));
  });
}

// METHODS
function getTasks() {
  var tasks = [];
  return _getProjectKeys().then(function(keys) {
    return Promise.all(keys.map(function(key) {
      return _getTasksByProjectKey(key).then(function(tList) {
        tList.forEach(function(t) {
          tasks.push(t);
        });
      });
    }));
  }).then(function() {
    var today = new Date();
    return tasks.filter(function(task) {
      return task.dueDate != null && !task.done;
    });
  });
}

getTasks().then(function(tasks) {
  console.log(tasks);
});

// EXPORTS
module.exports.getTasks = getTasks;
