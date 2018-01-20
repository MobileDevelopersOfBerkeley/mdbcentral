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
  return dbUtil.getAll(dbUtil.refs.scoreRef).then(function(scores) {
    scores = scores.filter(function(score) {
      return score.archived !== true;
    });
    var assignments;
    return getAll().then(function(aList) {
      assignments = aList;
      return getAllUsers();
    }).then(function(members) {
      return scores.map(function(score) {
        var aList = assignments.filter(function(a) {
          return a._key == score.assignmentId;
        });
        if (aList.length > 0) score.assignment_name = aList[0].name;
        var mList = members.filter(function(m) {
          return m._key == score.member;
        });
        if (mList.length > 0) score.member_name = mList[0].name;
        return score;
      })
    });
  }).then(function(scores) {
    return {
      scores: scores,
      num_scores: scores.length
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
