// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.scoreRef;
const nullScoreStr = " - ";

// HELPERS
function _filterByKeys(scores, ref, field) {
  return dbUtil.getAll(ref).then(function(objs) {
    var keys = objs.map(function(o) {
      return o._key;
    });
    return scores.filter(function(score) {
      return keys.indexOf(score[field]) >= 0;
    });
  });
}

function _filterArchived(scores) {
  return scores.filter(function(score) {
    return score.archived !== true;
  });
}

function _populateScoreInfo(score) {
  return dbUtil.getByKey(dbUtil.refs.assignmentRef, score.assignmentId)
    .then(function(a) {
      score.assignment_name = a.name;
      score.due = a.due;
      score.link = a.link;
      return dbUtil.getByKey(dbUtil.refs.memberRef, score.member);
    }).then(function(m) {
      score.member_name = m.name;
      return score;
    });
}

function _deep(scores) {
  scores = _filterArchived(scores);
  return _filterByKeys(scores, dbUtil.refs.assignmentRef, "assignmentId")
    .then(function(sList) {
      scores = sList;
      return _filterByKeys(scores, dbUtil.refs.memberRef, "member")
    }).then(function(sList) {
      scores = sList;
      return Promise.all(scores.map(_populateScoreInfo)).then(function() {
        return scores;
      });
    });
}

// METHODS
function getAllDeep() {
  return dbUtil.getAll(ref).then(_deep);
}

function getByMemberDeep(params) {
  return dbUtil.getByFields(ref, {
    member: params.member
  }).then(_deep);
}

function set(params) {
  return dbUtil.getByFields(ref, {
    member: params.memberId,
    assignmentId: params.assignmentId
  }).then(function(scores) {
    scores = _filterArchived(scores);
    if (scores.length == 0) {
      return dbUtil.createByAutoKey(ref, {
        score: params.score,
        archived: false,
        member: params.memberId,
        assignmentId: params.assignmentId
      });
    }
    return dbUtil.updateByKey(ref, scores[0]._key, {
      score: params.score,
      archived: false
    });
  });
}

function archive(params) {
  return dbUtil.updateByKey(ref, score._key, {
    archived: true
  });
}

// EXPORTS
module.exports.getAllDeep = getAllDeep;
module.exports.getByMemberDeep = getByMemberDeep;
module.exports.archive = archive;
module.exports.set = set;
