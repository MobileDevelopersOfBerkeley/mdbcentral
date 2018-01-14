// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const memberLogic = require("./Members.js");
const getUserById = memberLogic.getById;
const getAllUsers = memberLogic.getAll;
const scoresLogic = require("./Scores.js");

// CONSTANTS
const ref = dbUtil.refs.assignmentRef;
const nullScoreStr = " - ";

// HELPERS
function _getAssignments(roleId) {
  var assignments = [];
  return dbUtil.getAll(ref).then(function(assignments) {
    return assignments.filter(function(assignment) {
      return assignment.roleIds.indexOf(roleId) >= 0;
    });
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
      return getAssignmentScores({
        member: user._key,
        roleId: user.roleId
      }).then(function(assignments) {
        for (var i = 0; i < assignments.length; i++) {
          var assignment = assignments[i];
          assignment.assignment_name = assignment.name;
          assignment.member_name = user.name;
          result.push(assignment);
          if (assignment.score != nullScoreStr)
            num_scores += 1;
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

function getAssignmentScores(params) {
  var result = [];
  return _getAssignments(params.roleId).then(function(assignments) {
    var plist = [];
    assignments.forEach(function(assignment) {
      plist.push(scoresLogic.get({
        member: params.member,
        assignmentId: assignment._key
      }).then(function(score) {
        assignment.score = score.score;
        result.push(assignment);
      }));
    });
    return Promise.all(plist);
  }).then(function() {
    return result;
  });
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getByUid = getByUid;
module.exports.getAllScores = getAllScores;
module.exports.getAssignmentScores = getAssignmentScores;
