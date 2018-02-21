// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const util = require("../../util/util.js");
const signInLogic = require("../../logic/SignIns.js");
const signInCodeLogic = require("../../logic/SignInCode.js");
const memberLogic = require("../../logic/Members.js");
const eventLogic = require("../../logic/Events.js");
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

function _mergeSets(set1, set2) {
  var result = new Set();

  function addCb(e) {
    result.add(e);
  }

  set1.forEach(addCb);
  set2.forEach(addCb);
  return result;
}

function _setToList(set) {
  var result = [];
  set.forEach(function(e) {
    result.push(e);
  });
  return result;
}

function _getX(attendanceData) {
  var x = Object.keys(attendanceData).reduce(function(x, memberId) {
    var memberData = attendanceData[memberId];
    var eventIds1 = new Set(memberData.signIns.map(function(signIn) {
      return signIn.eventId;
    }));
    var eventIds2 = new Set(memberData.absences.map(function(event) {
      return event._key;
    }));
    x = _mergeSets(x, _mergeSets(eventIds1, eventIds2));
    return x;
  }, new Set());
  return _setToList(x);
}

function _getY(attendanceData, x) {
  return Object.keys(attendanceData).reduce(function(y, memberId) {
    var memberData = attendanceData[memberId];
    var attendances = y[0];
    var absences = y[1];
    memberData.absences.forEach(function(event) {
      var i = x.indexOf(event._key);
      if (!(i in attendances))
        attendances[i] = 0;
      attendances[i] += 1;
    });
    memberData.signIns.forEach(function(signIn) {
      var i = x.indexOf(signIn.eventId);
      if (!(i in absences))
        absences[i] = 0;
      absences[i] += 1;
    });
    return y;
  }, [
    [],
    []
  ]);
}

function _eventIdsToTitles(events, x) {
  var dict = events.reduce(function(dict, event) {
    dict[event._key] = event.title;
    return dict;
  }, {});
  return x.map(function(eventId) {
    return dict[eventId];
  });
}

function _sortByTime(events, x, y) {
  var eventIds = events.sort(function(a, b) {
    return a.timestamp - b.timestamp;
  }).map(function(event) {
    return event._key;
  });
  var sortedX = x.sort(function(a, b) {
    var iA = eventIds.indexOf(a);
    var iB = eventIds.indexOf(b);
    if (iA > iB) return 1;
    if (iA < iB) return -1;
    return 0;
  });
  var newX = [];
  var newY = [
    [],
    []
  ];
  var result = [newX, newY];
  x.forEach(function(eventId, i, arr) {
    var sortedI = sortedX.indexOf(eventId);
    newX[sortedI] = eventId;
    newY[0][sortedI] = y[0][i];
    newY[1][sortedI] = y[1][i];
  });
  return result;
}

function _getAttendanceOverTimeData(data) {
  var x, y;
  return signInLogic.getAllAttendance().then(function(a) {
    x = _getX(a);
    y = _getY(a, x);
    return eventLogic.getAll();
  }).then(function(events) {
    var z = _sortByTime(events, x, y);
    y = z[1];
    x = _eventIdsToTitles(events, z[0]);
    _getBar(data, [x, y], "attendance_bar");
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
        _getAttendanceOverTimeData(data),
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
