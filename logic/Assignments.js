// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const scoresUtil = require("./Scores.js");

// CONSTANTS
const ref = dbUtil.refs.assignmentRef;

// METHODS
function getAssignmentsByUid(uid) {
  return member_ref.child(uid).once("value").then(function(snapshot) {
    if (!snapshot.exists()) return [];
    var member = snapshot.val();
    return _getAssignments(member.roleId);
  });
}

function getAllAssignments() {
  return assignment_ref.once("value").then(function(snapshot) {
    if (!snapshot.exists()) return [];
    var dict = snapshot.val();
    var result = [];
    for (var key in dict) {
      var obj = dict[key];
      obj.key = key;
      result.push(obj);
    }
    return result;
  });
}

function _getAssignments(roleId) {
  var assignments = [];
  return assignment_ref.once("value").then(function(snapshot) {
    var assignments = [];
    if (!snapshot.exists()) return assignments;
    snapshot.forEach(function(childSnapshot) {
      var assignment = childSnapshot.val();
      assignment.key = childSnapshot.key;
      if (assignment.roleIds.indexOf(roleId) >= 0) {
        assignments.push(assignment);
      }
    });
    return assignments;
  });
}

function getAssignmentScores(uid, roleId) {
  var result = [];
  return _getAssignments(roleId).then(function(assignments) {
    var plist = [];
    assignments.forEach(function(assignment) {
      plist.push(scoresUtil.get(uid, assignment.key).then(function(
        score) {
        assignment.score = score.score;
        result.push(assignment);
      }));
    });
    return firebase.Promise.all(plist);
  }).then(function() {
    return result;
  });
}

function createAssignment(due, link, name, roleIds) {
  if (due == null || due.trim() == "")
    return firebase.Promise.reject(new Error("please fill in due date"));
  if (link == null || link.trim() == "")
    return firebase.Promise.reject(new Error("please fill in link"));
  if (name == null || name.trim() == "")
    return firebase.Promise.reject(new Error("please fill in name"));
  if (roleIds == null || roleIds.length == 0)
    return firebase.Promise.reject(new Error("please assign to at least 1 role"));
  for (var i = 0; i < roleIds.length; i++) {
    roleIds[i] = parseInt(roleIds[i]);
  }
  return assignment_ref.push().set({
    due: due,
    link: link,
    name: name,
    roleIds: roleIds
  });
}

function getProjectPercentages() {
  return github_cache_ref.once("value").then(function(snapshot) {
    var projectPercentages = [];
    var repoNameToUsernameToLines = JSON.parse(snapshot.val());
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

function getUserLines() {
  return github_cache_ref.once("value").then(function(snapshot) {
    var repoNameToUsernameToLines = JSON.parse(snapshot.val());
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

return {
  getUserLines: getUserLines,
  getProjectPercentages: getProjectPercentages,
  createAssignment: createAssignment,
  getAllAssignments: getAllAssignments,
  getAssignmentsByUid: getAssignmentsByUid,
  getAssignmentScores: getAssignmentScores,
  setScore: setScore,
  getAllScores: getAllScores
}
