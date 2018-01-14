// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.scoreRef;
const nullScoreStr = " - ";

// METHODS
function get(params) {
  return dbUtil.getObjectsByFields(ref, {
    member: params.uid,
    assignmentId: params.assignmentId
  }).then(function(scores) {
    if (scores.length > 0) return scores[0];
    return {
      score: nullScoreStr
    };
  });
}

function set(params) {
  return get(params.member, params.assignmentId).then(function(score) {
    if (score.key == null) {
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
