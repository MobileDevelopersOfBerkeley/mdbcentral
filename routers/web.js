// DEPENDENCIES
const router = require("express").Router();

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
    graphs: []
  });
});

router.get("/home", function(req, res) {
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
    leadership: false,
    getLiTag: _getLiTag("home"),
    graphs: []
  });
});

router.get("/assignments", function(req, res) {
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
    leadership: false,
    getLiTag: _getLiTag("assignments"),
    graphs: []
  });
});

router.get("/calendar", function(req, res) {
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
    leadership: false,
    getLiTag: _getLiTag("calendar"),
    graphs: []
  });
});

router.get("/leadership", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "leadership",
    leadership: false,
    getLiTag: _getLiTag("leadership"),
    graphs: []
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
  res.render("index", {
    docPath: getDocById(req.params.id),
    firstname: "Krishnan",
    notifications: [],
    currPage: "policies",
    leadership: false,
    getLiTag: _getLiTag("policies"),
    graphs: []
  });
});

router.get("/profile", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "profile",
    leadership: false,
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
