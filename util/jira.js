// DEPENDENCIES
const JiraApi = require("jira").JiraApi;

// INITIALIZE
var jira = new JiraApi(
  'https',
  process.env.JIRA_HOST,
  process.env.JIRA_PORT,
  process.env.JIRA_USERNAME,
  process.env.JIRA_PASSWORD,
  '2.0.alpha1'
);

// METHODS
function getTask(taskId) {
  return new Promise(function(resolve, reject) {
    jira.findIssue(taskId, function(error, issue) {
      if (error) reject(error);
      else resolve(issue);
    });
  })
}

// EXPORTS
module.exports.getTask = getTask;
