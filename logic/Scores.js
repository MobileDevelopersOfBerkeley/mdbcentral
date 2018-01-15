// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.scoreRef;
const nullScoreStr = " - ";

// METHODS
function get(params) {
  return dbUtil.getObjectsByFields(ref, {
    member: params.member,
    assignmentId: params.assignmentId
  }).then(function(scores) {
    if (scores.length > 0) return scores[0];
    return {
      score: nullScoreStr
    };
  });
}

function set(params) {
  return get({
    member: params.member,
    assignmentId: params.assignmentId
  }).then(function(score) {
    if (score.score == nullScoreStr) {
      return dbUtil.createNewObjectByAutoId(ref, {
        assignmentId: params.assignmentId,
        score: params.score,
        member: params.member
      });
    }
    return dbUtil.updateObject(ref, score._key, {
      score: params.score
    });
  });
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
