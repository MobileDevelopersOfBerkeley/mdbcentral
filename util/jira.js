// DEPENDENCIES
const JiraApi = require("jira").JiraApi;

// INITIALIZE
var jira = new JiraApi(
  'https',
  process.env.JIRA_HOST,
  process.env.JIRA_PORT,
  process.env.JIRA_USERNAME,
  process.env.JIRA_PASSWORD,
  '2'
);

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
  return new Promise(function(resolve, reject) {
    jira.findIssue(taskId, function(error, issue) {
      if (error) reject(error);
      else resolve(_formatTask(issue));
    });
  });
}

function _getProjectKeys() {
  return new Promise(function(resolve, reject) {
    jira.listProjects(function(error, data) {
      if (error) reject(error);
      else resolve(data.map(function(d) {
        return d.key;
      }));
    });
  });
}

function _getTasksByProjectKey(key) {
  return new Promise(function(resolve, reject) {
    jira.searchJira("project=\"" + key + "\"", {}, function(error, data) {
      if (error) reject(error);
      else resolve(Promise.all(data.issues.map(function(issue) {
        return _getTask(issue.id);
      })));
    });
  })
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
