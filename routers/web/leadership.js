// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const util = require("../../util/util.js");
const memberLogic = require("../../logic/Members.js");
const rolesLogic = require("../../logic/Roles.js");
const assignmentsLogic = require("../../logic/Assignments.js");
const scoreLogic = require("../../logic/Scores.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const feedbackLogic = require("../../logic/Feedback.js");
const githubCacheLogic = require("../../logic/GithubCache.js");
const paymentRequestLogic = require("../../logic/PaymentRequests.js");
const finReportLogic = require("../../logic/FinReports.js");
const eventLogic = require("../../logic/Events.js");
const semesterStartLogic = require("../../logic/SemesterStart.js");
const canSignUpLogic = require("../../logic/CanSignUp.js");
const signInCodeLogic = require("../../logic/SignInCode.js");
const signInLogic = require("../../logic/SignIns.js");

// HELPERS
function _roleIdsToString(roles, roleIds) {
  return roleIds.map(function(roleId) {
    return roles[roleId].title + " ";
  });
}

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

    plist.push(signInLogic.getAllAttendance().then(function(x) {
      data.attendanceData = x;
    }));

    plist.push(eventLogic.getByToday().then(function(event) {
      data.closestEventId = event._key
    }).catch(function(error) {
      data.closestEventId = null;
    }));

    plist.push(signInCodeLogic.get().then(function(code) {
      data.code = code;
    }));

    plist.push(canSignUpLogic.get().then(function(bool) {
      data.canSignUp = bool;
    }));

    plist.push(semesterStartLogic.get().then(function(semesterStart) {
      data.semesterStart = semesterStart;
    }));

    plist.push(paymentRequestLogic.getAll().then(function(requests) {
      data.requests = requests;
    }));

    plist.push(feedbackLogic.getAll().then(function(feedbacks) {
      data.feedbacks = feedbacks;
    }));

    plist.push(assignmentsLogic.getAll().then(function(assignments) {
      data.assignments = assignments;
    }));

    plist.push(scoreLogic.getAllDeep().then(function(scores) {
      data.scores = scores;
    }));

    plist.push(expectedAbsencesLogic.getAll()
      .then(function(expectedAbsences) {
        data.expectedAbsences = expectedAbsences;
      }));

    plist.push(githubCacheLogic.getUserLines().then(function(userLiness) {
      userLines = userLiness || {};
      return memberLogic.getAll();
    }).then(function(mList) {
      members = mList || [];
      members.forEach(function(member) {
        for (var username in userLines) {
          if (member.githubUsername == username) {
            member.totalLines = userLines[username];
            break;
          }
        }
      });

      data.members = members;
      total = members.length;

      var totalYears = {};
      var totalMajors = {};
      totalRoles = {};
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
          if (major.includes("electric")) major = "eecs";
          else if (major.includes("computer science"))
            major = "cs";
          else if (major.includes("business")) major =
            "business";
          else if (major.includes("engineering")) major =
            "engineering";
          else if (major.includes("math") || major.includes(
              "stat"))
            major = "math";
          if (major in totalMajors) totalMajors[major] +=
            1;
          else totalMajors[major] = 1;
        });
      });

      var d = util.genPieData(totalYears, true);
      data.graphs.push({
        elementId: "year_pie",
        type: "pie",
        xData: d[0],
        yData: d[1]
      })
      d = util.genPieData(totalMajors);
      data.graphs.push({
        elementId: "major_pie",
        type: "pie",
        xData: d[0],
        yData: d[1]
      });
      return rolesLogic.get();
    }).then(function(roles) {
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
      var d = util.genPieData(formattedTotalRoles, true);
      data.graphs.push({
        elementId: "role_pie",
        type: "pie",
        xData: d[0],
        yData: d[1]
      })
    }));
    return Promise.all(plist);
  }).then(function() {
    data.expectedAbsences = data.expectedAbsences.sort(function(a, b) {
      return a.title - b.title;
    });
    data.assignments = data.assignments.sort(function(a, b) {
      return a.due - b.due;
    });
    data.members = data.members.sort(function(a, b) {
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    data.roleIdsToString = _roleIdsToString;
    data.leaders = data.members.filter(function(member) {
      return member.leadership === true;
    });
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
