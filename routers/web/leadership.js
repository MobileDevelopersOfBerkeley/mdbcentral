// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const util = require("../../util/util.js");
const memberLogic = require("../../logic/Members.js");
const rolesLogic = require("../../logic/Roles.js");
const assignmentsLogic = require("../../logic/Assignments.js");
const scoreLogic = require("../../logic/Scores.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const githubCacheLogic = require("../../logic/GithubCache.js");
const finReportLogic = require("../../logic/FinReports.js");
const eventLogic = require("../../logic/Events.js");
const semesterStartLogic = require("../../logic/SemesterStart.js");
const canSignUpLogic = require("../../logic/CanSignUp.js");
const signInCodeLogic = require("../../logic/SignInCode.js");
const signInLogic = require("../../logic/SignIns.js");

// METHODS
router.get("/leadership", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  var data;
  helper.genData("leadership", member).then(function(d) {
    data = d;

    if (!data.leadership) {
      res.redirect("/home");
      return;
    }

    var plist = [];
    var members = [];
    var totalRoles = {};
    var userLines = {};
    var total = 0;

    plist.push(memberLogic.getAll().then(function(members) {
      data.members = members;
    }));

    return Promise.all(plist);
  }).then(function() {
    data.members = data.members.sort(function(a, b) {
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    data.leaders = data.members.filter(function(member) {
      return member.leadership === true;
    });
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
