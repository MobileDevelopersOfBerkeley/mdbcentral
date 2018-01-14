// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dateToString = require("../util/util.js").dateToString;
const dbUtil = require("../util/firebase/db.js");
const memberLogic = require("../logic/Members.js");
const rolesLogic = require("../logic/Roles.js");
const welcomeLogic = require("../logic/Welcome.js");
const assignmentsLogic = require("../logic/Assignments.js");
const expectedAbsencesLogic = require("../logic/ExpectedAbsences.js");
const config = require("../conf/config.json");

// HELPERS
function _getLiTag(currPage) {
  return function(page) {
    if (currPage != page) return "<li>";
    return "<li class='active'>";
  }
}

function _getFirstName(name) {
  if (name.indexOf(" ") < 0) return name;
  return name.split(" ")[0];
}

function _roleIdsToString(roleIds) {
  var roles = [];
  return roleIds.map(function(roleId) {
    return roles[roleId];
  });
}

function _getDocById(id) {
  return config.docs[id - 1];
}

function _genData(currPage, uid) {
  var data = {
    firstname: "Visitor",
    notifications: [],
    currPage: currPage,
    leadership: false,
    graphs: [],
    getLiTag: _getLiTag(currPage)
  };
  return rolesLogic.get().then(function(roles) {
    data.roles = roles;
    if (!uid) return Promise.resolve(data);
    return memberLogic.getById({
      id: uid
    }).then(function(user) {
      data.firstname = _getFirstName(user.name);
      data.leadership = user.leadership === true;
      data.user = user;
      return data;
    });
  });
}

// METHODS
router.get("/", function(req, res) {
  res.redirect("/home");
});

router.get("/login", function(req, res) {
  _genData("login").then(function(data) {
    res.render("index", data);
  });
});

router.get("/home", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var id = req.cookies.member;
  var data;
  _genData("home", id).then(function(d) {
    data = d;
    return memberLogic.getById({
      id: id
    });
  }).then(function(member) {
    var plist = [];
    var num_absences = 0;
    var num_expected = 0;

    plist.push(expectedAbsencesLogic.getByUid({
      member: id
    }).then(function(expectedAbsences) {
      data.expectedAbsences = expectedAbsences;
      num_expected = expectedAbsences.length;
    }));

    plist.push(memberLogic.getRole({
      id: id
    }).then(function(role) {
      data.role = role;
    }));

    plist.push(welcomeLogic.getEvent().then(function(event) {
      data.event = event.title || event.summary;
      data.eventId = event.id;
    }));

    plist.push(welcomeLogic.listAbsences({
      member: member
    }).then(function(absences) {
      data.absences = absences.length;
      num_absences = absences.length;
      return welcomeLogic.listSignIns({
        member: member
      });
    }).then(function(signins) {
      data.signins = signins;
      return memberLogic.getMaxAbsences({
        id: id
      });
    }).then(function(max_absences) {
      var absencesLeft = undefined;
      if (max_absences >= num_absences) {
        absencesLeft = "Left: " + (max_absences - num_absences);
      } else {
        absencesLeft = "Over: " + ((max_absences - num_absences) *
          -1);
      }
      data.graphs.push({
        elementId: "attendance_overview_bar",
        type: "bar",
        xData: ['Absences',
          'Inluding Expected', 'Max Absences'
        ],
        yData: [
          [num_absences, num_absences + num_expected,
            max_absences
          ]
        ]
      })
      var attendances = [];
      for (var i = 0; i < data.signins.length; i++) {
        var signin = data.signins[i];
        signin.type = "Attended";
        var date = new Date();
        date.setTime(signin.timestamp);
        signin.date = dateToString(date);
        attendances.push(signin);
      }
      for (var i = 0; i < data.absences.length; i++) {
        var absence = data.absences[i];
        absence.type = "Absent";
        var date = new Date();
        date.setTime(absence.timestamp);
        absence.date = dateToString(date);
        attendances.push(absence);
      }
      for (var i = 0; i < data.expectedAbsences.length; i++) {
        var expectedAbsence = data.expectedAbsences[i];
        expectedAbsence.type = "Expected Absent";
        var date = new Date();
        date.setTime(expectedAbsence.timestamp);
        expectedAbsence.date = dateToString(date);
        attendances.push(expectedAbsence);
      }
      data.absencesLeft = absencesLeft;
      data.attendances = attendances;
    }));

    return Promise.all(plist);
  }).then(function() {
    data.attendances = data.attendances.sort(function(a, b) {
      return a.timestamp - b.timestamp;
    });
    res.render("index", data);
  });
});

router.get("/assignments", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("assignments", member).then(function(data) {
    return assignmentsLogic.getAssignmentScores({
      member: member,
      roleId: data.user.roleId
    }).then(function(assignments) {
      data.assignments = assignments;
      res.render("index", data);
    });
  });
});

router.get("/calendar", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("calendar", member).then(function(data) {
    return welcomeLogic.getEventsSoFar().then(function(events) {
      data.events = events;
      return welcomeLogic.getEvent().catch(function(error) {
        return null;
      });
    }).then(function(event) {
      if (event) data.closestEventId = event.id;
      else data.closestEventId = null;
      res.render("index", data);
    });
  });
});

router.get("/leadership", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  memberLogic.isLeadership({
    id: req.cookies.member
  }).then(function(bool) {
    if (!bool) {
      res.redirect("/home");
      return;
    }
    /*
    var plist = [];

    var totalWatchList = 0;
    var totalBoardReviewList = 0;
    var members = [];
    var totalRoles = {};
    var total = 0;

    function genData(x, noStr) {
      var strs = [];
      var values = [];
      for (var key in x) {
        var value = x[key]
        var percent = Math.ceil((value / total) * 100);
        if (percent > 0) {
          var percent_str = percent + "%";
          var str = "";
          if (!noStr)
            str = key + " (" + percent_str + ")";
          else
            str = percent_str + " (" + value + ")";
          strs.push(str);
          values.push(percent);
        }
      }
      return [strs, values];
    }

    // plist.push(Assignments.getProjectPercentages().then(function(
    // 	projectPercentages) {
    // 	$scope.$apply(function() {
    // 		$scope.projectPercentages = projectPercentages;
    // 		$scope.project_id = projectPercentages[0].id;
    // 	});
    // }));

    plist.push(Attendance.listAllFeedback().then(function(feedbacks) {
      $scope.$apply(function() {
        $scope.feedbacks = feedbacks;
      });
    }));

    plist.push(Assignments.getAllAssignments().then(function(assignments) {
      $scope.$apply(function() {
        $scope.assignments = assignments;
        $scope.score_overview_assignmentId = assignments[0].key;
      });
      if (assignments.length == 0) return [];
      return Assignments.getAllScores(assignments[0].key);
    }).then(scoreCallback));

    // plist.push(Attendance.getSignInCode().then(function(code) {
    // 	$scope.$apply(function() {
    // 		$scope.set_signin_code_text = code;
    // 	});
    // }));

    // plist.push(Attendance.getSignInMinutes().then(function(minutes) {
    // 	$scope.$apply(function() {
    // 		$scope.set_signin_code_minutes = minutes;
    // 	});
    // }));

    plist.push(Attendance.listAllExpectedAbsences().then(function(
      expectedAbsences) {
      $scope.$apply(function() {
        $scope.expectedAbsences = expectedAbsences;
      });
    }));

    var userLines = {};
    plist.push(Assignments.getUserLines().then(function(userLiness) {
      userLines = userLiness || {};
      return Member.listMembers();
    }).then(function(memberss) {
      members = memberss || [];
      members.forEach(function(member) {
        for (var username in userLines) {
          if (member.githubUsername == username) {
            member.totalLines = userLines[username];
            break;
          }
        }
      });
      $scope.$apply(function() {
        $scope.members = members;
      });
      // 	return Member.getTotalWatchList();
      // }).then(function(totalWatchListt) {
      // 	totalWatchList = totalWatchListt;
      // 	return Member.getTotalBoardReviewList();
      // }).then(function(totalBoardReviewListt) {
      // totalBoardReviewList = totalBoardReviewListt;
      // totalWatchList -= totalBoardReviewList;
      total = members.length;

      // if (totalWatchList != 0 && totalBoardReviewList == 0)
      // 	totalBoardReviewList = .001;
      //
      // var totalShortList = {
      // 	"Fine": total - totalWatchList - totalBoardReviewList,
      // 	"BoardReviewList": totalBoardReviewList,
      // 	"WatchList": totalWatchList
      // };
      // var data = genData(totalShortList, true);
      // graphPie("#shortlist_pie", data[0], data[1]);

      var totalYears = {};
      var totalMajors = {};
      totalRoles = {};
      members.forEach(function(member) {
        if (member.year in totalYears) totalYears[member.year] += 1;
        else totalYears[member.year] = 1;
        if (member.roleId in totalRoles) totalRoles[member.roleId] += 1;
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
          else if (major.includes("computer science")) major = "cs";
          else if (major.includes("business")) major = "business";
          else if (major.includes("engineering")) major = "engineering";
          else if (major.includes("math") || major.includes("stat"))
            major = "math";
          if (major in totalMajors) totalMajors[major] += 1;
          else totalMajors[major] = 1;
        });
      });

      var data = genData(totalYears, true);
      graphPie("#year_pie", data[0], data[1]);
      data = genData(totalMajors);
      graphPie("#major_pie", data[0], data[1]);
      return Member.getRoles();
    }).then(function(roles) {
      $scope.$apply(function() {
        $scope.roles = roles;
      });
      var formattedTotalRoles = {
        "Leaders": 0,
        "DevCore": 0,
        "Web": 0,
        "Market": 0,
        "Explor": 0
      };
      for (var roleId in totalRoles) {
        var roleName = roles[roleId];
        var num = totalRoles[roleId];
        if (roleName.includes("VP") || roleName.includes("Director") ||
          roleName.includes("President") || roleName.includes("Advisor"))
          formattedTotalRoles["Leaders"] += num;
        else if (roleName.includes("Android") || roleName.includes("iOS") ||
          roleName.includes("Contract"))
          formattedTotalRoles["DevCore"] += num;
        else if (roleName.includes("Web"))
          formattedTotalRoles["Web"] += num;
        else if (roleName.includes("Market"))
          formattedTotalRoles["Market"] += num;
        else if (roleName.includes("Explor"))
          formattedTotalRoles["Explor"] += num;
      }
      data = genData(formattedTotalRoles, true);
      graphPie("#role_pie", data[0], data[1]);
    }));

    // plist.push(Attendance.getSummaryBarData().then(function(x) {
    // 	[x_events, data] = x;
    // 	graphBar("#summary_attendance_bar", x_events, data);
    // }));
    */
    res.render("index", {
      firstname: "Krishnan",
      notifications: [],
      currPage: "leadership",
      leadership: true,
      getLiTag: _getLiTag("leadership"),
      graphs: [],
      users: [].sort(function(a, b) {
        return b.name - a.name;
      }),
      expectedAbsences: [].sort(function(a, b) {
        return a.title - b.title;
      }),
      _roleIdsToString: _roleIdsToString,
      assignments: [].sort(function(a, b) {
        return a.due - b.due;
      }),
      roles: [],
      assignments: [],
      scores: [],
      feedbacks: []
    });
  });
});

router.get("/policies", function(req, res) {
  res.redirect("/policies/1");
});

router.get("/policies/:id", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("policies", member).then(function(data) {
    data.docPath = _getDocById(req.params.id);
    res.render("index", data);
  });
});

router.get("/profile", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("profile", member).then(function(data) {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
