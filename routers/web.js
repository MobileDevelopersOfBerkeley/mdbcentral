// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const userLogic = require("../logic/Users.js");

// HELPERS
function _getLiTag(currPage) {
  return function(page) {
    if (currPage != page) return "<li>";
    return "<li class='active'>";
  }
}

// METHODS
router.get("/", function(req, res) {
  res.redirect("/home");
});

router.get("/login", function(req, res) {
  /*
  plist.push(Member.getRoles().then(function(roles) {
		$scope.$apply(function() {
			$scope.roles = roles;
		});
	}));
  */
  res.render("index", {
    currPage: "login",
    roles: [],
    graphs: [],
    getLiTag: _getLiTag("login"),
    leadership: true,
    firstname: "Visitor",
    notifications: []
  });
});

router.get("/home", function(req, res) {
  if (!req.cookies.userId) res.redirect("/login");
  /*
  return Member.getMember(currentUser.uid).then(function(member) {
    var plist = [];
    var num_absences = 0;
    var num_expected = 0;
    plist.push(Attendance.listExpectedAbsences(currentUser.uid).then(
      function(expectedAbsences) {
        $scope.$apply(function() {
          $scope.expectedAbsences = expectedAbsences;
          num_expected = expectedAbsences.length;
        });
      }));
    plist.push(Welcome.listAbsences(member).then(function(
      absences) {
      $scope.$apply(function() {
        $scope.absences = absences;
        num_absences = absences.length;
      });
      return Welcome.listSignIns(member);
    }).then(function(signins) {
      $scope.$apply(function() {
        $scope.signins = signins;
      });
      return Attendance.getMaxAbsences(currentUser.uid);
    }).then(function(max_absences) {
      var absencesLeft = undefined;
      if (max_absences >= num_absences) {
        absencesLeft = "Left: " + (max_absences - num_absences);
      } else {
        absencesLeft = "Over: " + ((max_absences - num_absences) * -1);
      }
      graphBar("#attendance_overview_bar", ['Absences',
        'Inluding Expected', 'Max Absences'
      ], [
        [num_absences, num_absences + num_expected, max_absences]
      ]);
      var attendances = [];
      for (var i = 0; i < $scope.signins.length; i++) {
        var signin = $scope.signins[i];
        signin.type = "Attended";
        var date = new Date();
        date.setTime(signin.timestamp);
        signin.date = dateToString(date);
        attendances.push(signin);
      }
      for (var i = 0; i < $scope.absences.length; i++) {
        var absence = $scope.absences[i];
        absence.type = "Absent";
        var date = new Date();
        date.setTime(absence.timestamp);
        absence.date = dateToString(date);
        attendances.push(absence);
      }
      for (var i = 0; i < $scope.expectedAbsences.length; i++) {
        var expectedAbsence = $scope.expectedAbsences[i];
        expectedAbsence.type = "Expected Absent";
        var date = new Date();
        date.setTime(expectedAbsence.timestamp);
        expectedAbsence.date = dateToString(date);
        attendances.push(expectedAbsence);
      }
      $scope.$apply(function() {
        $scope.absencesLeft = absencesLeft;
        $scope.attendances = attendances;
      });
    }));
    plist.push(Member.getRole(currentUser.uid).then(function(role) {
      $scope.$apply(function() {
        $scope.role = role;
      });
    }));
    plist.push(Welcome.getEvent().then(function(event) {
      $scope.$apply(function() {
        $scope.event = event.title || event.summary;
        $scope.eventId = event.id;
      });
    }));
  */
  res.render("index", {
    absencesLeft: 3,
    attendances: [].sort(function(a, b) {
      return a.timestamp - b.timestamp;
    }),
    firstname: "Krishnan",
    notifications: [],
    currPage: "home",
    leadership: true,
    getLiTag: _getLiTag("home"),
    graphs: []
  });
});

router.get("/assignments", function(req, res) {
  if (!req.cookies.userId) res.redirect("/login");
  /*
  return Member.getMember(currentUser.uid).then(function(member) {
    return Assignments.getAssignmentScores(currentUser.uid, member.roleId);
  }).then(function(assignments) {
    $scope.$apply(function() {
      $scope.assignments = assignments;
    });
  });
  */
  res.render("index", {
    assignments: [],
    firstname: "Krishnan",
    notifications: [],
    currPage: "assignments",
    leadership: true,
    getLiTag: _getLiTag("assignments"),
    graphs: []
  });
});

router.get("/calendar", function(req, res) {
  if (!req.cookies.userId) res.redirect("/login");
  /*
  Attendance.getEventsSoFar().then(function(events) {
    $scope.$apply(function() {
      $scope.events = events;
      changeSpinnerSync(false);
    });
  });
  */
  res.render("index", {
    events: [],
    closestEventId: "?",
    firstname: "Krishnan",
    notifications: [],
    currPage: "calendar",
    leadership: true,
    getLiTag: _getLiTag("calendar"),
    graphs: []
  });
});

function roleIdsToString(roleIds) {
  var roles = [];
  return roleIds.map(function(roleId) {
    return roles[roleId];
  });
}

router.get("/leadership", function(req, res) {
  if (!req.cookies.userId) res.redirect("/login");
  userLogic.isLeadership({
    id: req.cookies.userId
  }).then(function(bool) {
    if (!bool) res.redirect("/home");
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
      roleIdsToString: roleIdsToString,
      assignments: [].sort(function(a, b) {
        return a.due - b.due;
      }),
      roles: [],
      assignments: [],
      scores: [],
      feedbacks: []
    });
  }).catch(function(error) {
    res.redirect("/home");
  });
});

function getDocById(id) {
  return [
    "/docs/AttendancePolicy.pdf",
    "/docs/MembershipExpectations.pdf",
    "/docs/RoleResponsibilities.pdf",
    "/docs/MembershipProgramOverview.pdf",
    "/docs/DevCycleInformation.pdf",
    "/docs/GithubWorkflow.pdf",
    "/docs/AndroidHandbook.pdf",
    "/docs/iOSHandbook.pdf",
    "/docs/ReimbursementPolicy.pdf",
    "/docs/BigLittleProgram.pdf",
    "/docs/WTGT.pdf",
    "/docs/InactivePolicy.pdf"
  ][id - 1];
}

router.get("/policies", function(req, res) {
  res.redirect("/policies/1");
});

router.get("/policies/:id", function(req, res) {
  if (!req.cookies.userId) res.redirect("/login");
  res.render("index", {
    docPath: getDocById(req.params.id),
    firstname: "Krishnan",
    notifications: [],
    currPage: "policies",
    leadership: true,
    getLiTag: _getLiTag("policies"),
    graphs: []
  });
});

router.get("/profile", function(req, res) {
  if (!req.cookies.userId) res.redirect("/login");
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "profile",
    leadership: true,
    getLiTag: _getLiTag("profile"),
    graphs: [],
    user: {
      roleId: 0
    },
    roles: ["Da Boss"]
  });
});

// EXPORTS
module.exports = router;
