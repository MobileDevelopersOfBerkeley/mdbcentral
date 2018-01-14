// DEPENDENCIES
const githubUtil = require("../util/github.js");
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.githubCacheRef;

// HELPERS
function _get() {
  return ref.once("value").then(function(snapshot) {
    if (!snapshot.exists()) return {};
    return JSON.parse(snapshot.val());
  });
}

// METHODS
function update() {
  return githubUtil.getCache().then(function(cache) {
    return ref.set(JSON.stringify(cache, null, 2));
  });
}

function getUserLines() {
  return _get().then(function(repoNameToUsernameToLines) {
    var result = {}
    for (var repoName in repoNameToUsernameToLines) {
      var usernameToLines = repoNameToUsernameToLines[repoName];
      for (var username in usernameToLines) {
        var lines = usernameToLines[username];
        if (username in result) {
          result[username] += lines;
        } else {
          result[username] = lines;
        }
      }
    }
    return result;
  });
}

function getProjectPercentages() {
  return _get().then(function(repoNameToUsernameToLines) {
    var projectPercentages = [];
    for (var repoName in repoNameToUsernameToLines) {
      var projectPercentage = {
        id: repoName,
        name: repoName,
        percentages: [
          [],
          []
        ]
      };
      var userToLinesMap = repoNameToUsernameToLines[repoName];
      var totalLines = 0;
      for (var user in userToLinesMap) {
        totalLines += userToLinesMap[user];
      }
      for (var user in userToLinesMap) {
        var x = Math.ceil((userToLinesMap[user] / totalLines) * 100);
        if (x == 0) x = 1;
        projectPercentage.percentages[0].push(user + "(" + x + "%)");
        projectPercentage.percentages[1].push(x);
      }
      projectPercentages.push(projectPercentage);
    }
    return projectPercentages;
  });
}

// EXPORTS
module.exports.update = update;
module.exports.getUserLines = getUserLines;
module.exporst.getProjectPercentages = getProjectPercentages;
