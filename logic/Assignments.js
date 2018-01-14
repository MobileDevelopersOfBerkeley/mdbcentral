// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const getUserById = require("./Users.js").getById;
const scoresUtil = require("./Scores.js");

// CONSTANTS
const ref = dbUtil.refs.assignmentRef;

// HELPERS
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

function _getAssignmentScores(uid, roleId) {
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


// METHODS
function create(params) {
  return dbUtil.createNewObjectByAutoId(ref, {
    due: params.due,
    link: params.link,
    name: params.name,
    roleIds: params.roleIds
  });
}

function getAll() {
  return dbUtil.getAll(ref);
}

function getByUid(params) {
  return getUserById(params.uid).then(function(user) {
    return _getAssignments(user.roleId);
  }).catch(function(error) {
    return [];
  });
}

function getAllScores(params) {
  var result = [];
  var num_scores = 0;
  return getAllUsers().then(function(users) {
    return Promise.all(users.map(function(user) {
      return _getAssignmentScores(member.uid, member.roleId)
        .then(function(assignments) {
          for (var i = 0; i < assignments.length; i++) {
            var assignment = assignments[i];
            if (assignment.key == params.assignmentId) {
              assignment.assignment_name = assignment.name;
              assignment.member_name = member.name;
              result.push(assignment);
              if (assignment.score != nullScoreStr)
                num_scores += 1;
            }
          }
        })
    }));
  }).then(function() {
    return {
      scores: result,
      num_scores: num_scores
    };
  });
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getByUid = getByUid;
module.exports.getAllScores = getAllScores;
