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

// METHODS
function getTasks() {
  return new Promise(function(resolve, reject) {
    jira.searchJira("", {}, function(error, data) {
      if (error) reject(new Error("Can't get all issues: " + error.toString()));
      else resolve(Promise.all(data.issues.map(function(issue) {
        return _getTask(issue.key).catch(function(error) {
          return new Error("Can't find issue w/ key: " +
            issue.key);
        });
      })));
    });
  }).then(function(tasks) {
    var today = new Date();
    return tasks.filter(function(task) {
      return task.dueDate != null && !task.done;
    });
  });
}

// EXPORTS
module.exports.getTasks = getTasks;
