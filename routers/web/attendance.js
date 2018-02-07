// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const signInLogic = require("../../logic/SignIns.js");
const signInCodeLogic = require("../../logic/SignInCode.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const memberLogic = require("../../logic/Members.js");

// METHODS
router.get("/attendance", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  var data;
  helper.genData("attendance", member).then(function(dat) {
    data = dat;
    var plist = [];
    plist.push(signInLogic.getAllAttendance().then(function(x) {
      data.attendanceData = x;
    }));
    plist.push(signInCodeLogic.get().then(function(code) {
      data.code = code;
    }));
    plist.push(expectedAbsencesLogic.getAll().then(function(x) {
      data.expectedAbsences = x;
    }));
    plist.push(memberLogic.getAll().then(function(members) {
      data.members = members;
    }));
    return Promise.all(plist);
  }).then(function() {
    data.expectedAbsences = data.expectedAbsences.sort(function(a, b) {
      return a.title - b.title;
    });
    data.members = data.members.sort(function(a, b) {
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
