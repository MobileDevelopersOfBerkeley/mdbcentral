// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const assignmentsLogic = require("../../logic/Assignments.js");

// METHODS
router.get("/assignments", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  helper.genData("assignments", member).then(function(data) {
    return assignmentsLogic.getAssignmentScores({
      member: member,
      roleId: data.user.roleId
    }).then(function(assignments) {
      data.assignments = assignments;
      res.render("index", data);
    });
  });
});

// EXPORTS
module.exports = router;
