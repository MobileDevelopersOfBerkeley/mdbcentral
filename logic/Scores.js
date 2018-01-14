// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.scoreRef;
const nullScoreStr = " - ";

// METHODS
function get(params) {
  return dbUtil.getObjectsByFields(ref, {
    userId: params.uid,
    assignmentId: params.assignmentId
  }).then(function(scores) {
    if (scores.length > 0) return scores[0];
    return {
      score: nullScoreStr
    };
  });
}

function set(params) {
  return get(uid, assignmentId).then(function(score) {
    if (score.key == null) {
      return dbUtil.createNewObjectByAutoId(ref, {
        assignmentId: params.assignmentId,
        score: params.score,
        userId: params.uid
      });
    }
    return dbUtil.updateObject(ref, score._key, {
      score: params.score
    });
  });
}

function getAllScores(params) {
  // var result = [];
  // var num_scores = 0;
  // return Member.listMembers().then(function(members) {
  //   var plist = [];
  //   members.forEach(function(member) {
  //     plist.push(getAssignmentScores(member.uid, member.roleId).then(
  //       function(assignments) {
  //         for (var i = 0; i < assignments.length; i++) {
  //           var assignment = assignments[i];
  //           if (assignment.key == params.assignmentId) {
  //             assignment.assignment_name = assignment.name;
  //             assignment.member_name = member.name;
  //             result.push(assignment);
  //             if (assignment.score != nullScoreStr)
  //               num_scores += 1;
  //           }
  //         }
  //       }));
  //   });
  //   return firebase.Promise.all(plist);
  // }).then(function() {
  //   return {
  //     scores: result,
  //     num_scores: num_scores
  //   };
  // });
}

// EXPORTS
module.exports.get = get;
