// DEPENDENCIES
const githubUtil = require("../util/github.js");
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.githubCacheRef;

// METHODS
function get() {
  return dbUtil.getRaw(ref).then(function(cache) {
    if (!cache) return {};
    return JSON.parse(cache);
  });
}

function update() {
  return githubUtil.getCache().then(function(cache) {
    return dbUtil.setRaw(ref, JSON.parse(snapshot.val()));
  });
}

function getUserLines() {
  return get().then(function(repoNameToUsernameToLines) {
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
  return get().then(function(repoNameToUsernameToLines) {
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
module.exports.get = get;
module.exports.update = update;
module.exports.getUserLines = getUserLines;
module.exports.getProjectPercentages = getProjectPercentages;
