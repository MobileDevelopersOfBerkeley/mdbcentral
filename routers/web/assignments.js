// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const scoresLogic = require("../../logic/Scores.js");
const assignmentsLogic = require("../../logic/Assignments.js");
const scoreLogic = require("../../logic/Scores.js");
const memberLogic = require("../../logic/Members.js");

// HELPERS
function _roleIdsToString(roles, roleIds) {
  return roleIds.map(function(roleId) {
    return roles[roleId].title + " ";
  });
}

// METHODS
router.get("/assignments", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  helper.genData("assignments", member).then(function(data) {
    return scoresLogic.getByMemberDeep({
      member: member
    }).then(function(scores) {
      data.scores = scores;
      var plist = [];
      plist.push(assignmentsLogic.getAll().then(function(
        assignments) {
        data.assignments = assignments.sort(function(a, b) {
          return a.due - b.due;
        });
      }));
      plist.push(memberLogic.getAll().then(function(members) {
        data.members = members;
      }));
      plist.push(scoreLogic.getAllDeep().then(function(scores) {
        data.allscores = scores;
      }));
      return Promise.all(plist).then(function() {
        data.roleIdsToString = _roleIdsToString;
        res.render("index", data);
      });
    });
  });
});

// EXPORTS
module.exports = router;
