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

// METHODS
function getTask(taskId) {
  return new Promise(function(resolve, reject) {
    jira.findIssue(taskId, function(error, issue) {
      if (error) reject(error);
      else resolve({
        id: taskId,
        dueDate: task.fields.duedate,
        recipient: task.fields.assignee.displayName
      });
    });
  })
}

// EXPORTS
module.exports.getTask = getTask;
