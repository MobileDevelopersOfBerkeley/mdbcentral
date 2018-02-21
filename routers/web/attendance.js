// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const util = require("../../util/util.js");
const signInLogic = require("../../logic/SignIns.js");
const signInCodeLogic = require("../../logic/SignInCode.js");
const memberLogic = require("../../logic/Members.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const rolesLogic = require("../../logic/Roles.js");
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

function _getPie(data, d, elementId, pieBool) {
  d = util.genPieData(d, pieBool || false);
  data.graphs.push({
    elementId: elementId,
    type: "pie",
    xData: d[0],
    yData: d[1]
  });
}

function _getBar(data, d, elementId) {
  d = util.formatLineData(d);
  data.graphs.push({
    elementId: elementId,
    type: "bar",
    xData: d[0],
    yData: d[1]
  });
}

function _getMemberDataHelper(members) {
  var totalYears = {};
  var totalMajors = {};
  var totalRoles = {};
  members.forEach(function(member) {
    if (member.year in totalYears)
      totalYears[member.year] += 1;
    else totalYears[member.year] = 1;
    if (member.roleId in totalRoles)
      totalRoles[member.roleId] += 1;
    else totalRoles[member.roleId] = 1;
    var major = member.major.trim().toLowerCase();
    var majors = [];
    if (major.includes(",")) {
      majors = major.split(",");
    } else if (major.includes("/")) {
      majors = major.split("/");
    } else if (major.includes("+")) {
      majors = major.split("+");
    } else {
      majors.push(major);
    }
    majors.forEach(function(major) {
      major = major.trim();
      if (major.includes("electric")) major =
        "eecs";
      else if (major.includes("computer science"))
        major = "cs";
      else if (major.includes("business")) major =
        "business";
      else if (major.includes("engineering"))
        major =
        "engineering";
      else if (major.includes("math") || major.includes(
          "stat"))
        major = "math";
      if (major in totalMajors) totalMajors[major] +=
        1;
      else totalMajors[major] = 1;
    });
  });
  return [totalYears, totalMajors, totalRoles];
}

function _getRoleData(data, totalRoles) {
  return rolesLogic.get().then(function(roles) {
    data.roles = roles;
    var formattedTotalRoles = {
      "Leaders": 0,
      "DevCore": 0,
      "Web": 0,
      "Market": 0,
      "Explor": 0
    };
    for (var roleId in totalRoles) {
      var roleName = roles[roleId].title;
      var num = totalRoles[roleId];
      if (roleName.includes("VP") || roleName.includes(
          "Director") ||
        roleName.includes("President") || roleName.includes(
          "Advisor"))
        formattedTotalRoles["Leaders"] += num;
      else if (roleName.includes("Android") || roleName.includes(
          "iOS") ||
        roleName.includes("Contract"))
        formattedTotalRoles["DevCore"] += num;
      else if (roleName.includes("Web"))
        formattedTotalRoles["Web"] += num;
      else if (roleName.includes("Market"))
        formattedTotalRoles["Market"] += num;
      else if (roleName.includes("Explor"))
        formattedTotalRoles["Explor"] += num;
    }
    _getPie(data, formattedTotalRoles, "role_pie", true);
  });
}

function _getMemberData(data) {
  return helper.getMembers(data).then(function() {
    var j = _getMemberDataHelper(data.members);
    var totalYears = j[0];
    var totalMajors = j[1];
    var totalRoles = j[2];
    _getPie(data, totalYears, "year_pie", true);
    _getPie(data, totalMajors, "major_pie");
    return _getRoleData(data, totalRoles);
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
        _getMemberData(data),
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
