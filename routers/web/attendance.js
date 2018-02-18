// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const signInLogic = require("../../logic/SignIns.js");
const signInCodeLogic = require("../../logic/SignInCode.js");
const memberLogic = require("../../logic/Members.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const config = require("../../config.json");

// CONSTANTS
const newMaxAbsences = config.newMaxAbsences;
const oldMaxAbsences = config.oldMaxAbsences;

// HELPERS
function _getColor(attendance, members, memberId) {
  var numAbsences = attendance[memberId].absences.length;
  var newMember = members.filter(function(x) {
    return x._key == memberId;
  })[0].newMember === true;
  var maxAbsences = newMember ? newMaxAbsences : oldMaxAbsences;
  if (numAbsences == 0) return "text-success";
  if (numAbsences > maxAbsences) return "text-danger";
  return "text-warning";
}

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
    });
  });
}

function _getManualSignIns(data) {
  var members;
  return memberLogic.getAll().then(function(x) {
    members = x;
    return signInLogic.getAllManual()
  }).then(function(x) {
    data.manualSignIns = x.map(function(signIn) {
      var member = members.filter(function(member) {
        return member._key == signIn.member;
      })[0];
      signIn.profileImage = member.profileImage;
      signIn.name = member.name;
      return signIn;
    });
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
        _getManualSignIns(data),
        _getAttendance(data),
        _getSignInCode(data),
        _getExpectedAbsences(data),
        helper.getMembers(data)
      ]);
      return Promise.all(plist);
    }).then(function() {
      data.getColor = _getColor;
      res.render("index", data);
    });
  });

// EXPORTS
module.exports = router;
