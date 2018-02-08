// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const signInLogic = require("../../logic/SignIns.js");
const signInCodeLogic = require("../../logic/SignInCode.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");

// HELPERS
function _getAttendance(data) {
  return signInLogic.getAllAttendance().then(function(x) {
    data.attendanceData = x;
  });
}

function _getSignInCode(data) {
  return signInCodeLogic.get().then(function(code) {
    data.code = code;
  });
}

function _getExpectedAbsences(data) {
  return expectedAbsencesLogic.getAll().then(function(x) {
    data.expectedAbsences = x.sort(function(a, b) {
      return a.title - b.title;
    });;
  });
}

// METHODS
router.get("/attendance", helper.isLoggedIn, helper.isLeadership,
  function(req, res) {
    var member = req.cookies.member;
    var data;
    helper.genData("attendance", member).then(function(dat) {
      data = dat;
      return Promise.all([
        _getAttendance(data),
        _getSignInCode(data),
        _getExpectedAbsences(data),
        helper.getMembers(data)
      ]);
      return Promise.all(plist);
    }).then(function() {
      res.render("index", data);
    });
  });

// EXPORTS
module.exports = router;
