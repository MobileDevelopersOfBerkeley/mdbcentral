// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const util = require("../../util/util.js");
const assignmentsLogic = require("../../logic/Assignments.js");
const scoreLogic = require("../../logic/Scores.js");

// HELPERS
function _roleIdsToString(roles, roleIds) {
  return roleIds.map(function(roleId) {
    return roles[roleId].title + " ";
  });
}

function _getAssignments(data) {
  return assignmentsLogic.getAll().then(function(assignments) {
    data.assignments = assignments.sort(function(a, b) {
      return a.due - b.due;
    });
  })
}

function _setStats(scores) {
  new Set(scores.map(function(x) {
    return x.assignmentId;
  })).forEach(function(assignmentId) {
    var sList = scores.filter(function(x) {
      return x.assignmentId == assignmentId;
    });
    var stats = util.getStats(sList.map(function(x) {
      return parseInt(x.score.split("/")[0]);
    }));
    sList.forEach(function(x) {
      x._mean = stats.mean;
      x._stdev = stats.stdev;
    });
  });
  return scores;
}

function _getScores(data, member) {
  return scoreLogic.getByMemberDeep({
    member: member
  }).then(_setStats).then(function(scores) {
    data.scores = scores;
  });
}

function _getAllScores(data) {
  return scoreLogic.getAllDeep().then(_setStats).then(function(scores) {
    data.allscores = scores;
  });
}

// METHODS
router.get("/assignments", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  var data;
  helper.genData("assignments", member).then(function(d) {
    data = d;
    data.roleIdsToString = _roleIdsToString;
    return Promise.all([
      _getScores(data, member),
      _getAssignments(data),
      helper.getMembers(data),
      _getAllScores(data)
    ]);
  }).then(function() {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
