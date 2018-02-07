// DEPENDENCIES
const router = require("express").Router();
const util = require("../../util/util.js");
const helper = require("../helper.js");
const memberLogic = require("../../logic/Members.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const eventLogic = require("../../logic/Events.js");
const signInLogic = require("../../logic/SignIns.js");
const canSignUpLogic = require("../../logic/CanSignUp.js");

// METHODS
router.get("/", function(req, res) {
  res.redirect("/home");
});

router.get("/home", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var id = req.cookies.member;
  var data;
  helper.genData("home", id).then(function(d) {
    data = d;
    return memberLogic.getById({
      id: id
    });
  }).then(function(member) {
    var plist = [];
    var num_expected;

    plist.push(canSignUpLogic.get().then(function(bool) {
      data.canSignUp = bool;
    }));
    plist.push(expectedAbsencesLogic.getByUid({
      member: id
    }).then(function(expectedAbsences) {
      data.expectedAbsences = expectedAbsences;
      num_expected = expectedAbsences.length;
      return signInLogic.getAllAttendance();
    }).then(function(a) {
      var attendance = a[id];
      data.absences = attendance.absences;
      data.signins = attendance.signIns;

      // TODO: implement max absence policies
      const max_absences = 5;
      var num_absences = data.absences.length;

      var absencesLeft = undefined;
      if (max_absences >= num_absences) {
        absencesLeft = "Left: " + (max_absences -
          num_absences);
      } else {
        absencesLeft = "Over: " + ((max_absences -
            num_absences) *
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
      });
      var attendances = [];
      for (var i = 0; i < data.signins.length; i++) {
        var signin = data.signins[i];
        signin.type = "Attended";
        var date = new Date();
        date.setTime(signin.lastUpdated);
        signin.date = util.dateToString(date);
        signin.title = data.events.filter(function(event) {
          return signin.eventId == event._key;
        })[0].title;
        attendances.push(signin);
      }
      for (var i = 0; i < data.absences.length; i++) {
        var absence = data.absences[i];
        absence.type = "Absent";
        var date = new Date();
        date.setTime(absence.timestamp);
        absence.date = util.dateToString(date);
        attendances.push(absence);
      }
      for (var i = 0; i < data.expectedAbsences.length; i++) {
        var expectedAbsence = data.expectedAbsences[i];
        expectedAbsence.type = "Expected Absent";
        var event = data.events.filter(function(event) {
          return event._key == expectedAbsence.id;
        });
        var date = new Date();
        date.setTime(event.timestamp);
        expectedAbsence.date = util.dateToString(date);
        expectedAbsence.title = event.title;
        attendances.push(expectedAbsence);
      }
      data.absencesLeft = absencesLeft;
      data.attendances = attendances.sort(function(a, b) {
        return a.timestamp - b.timestamp;
      });
    }));

    plist.push(memberLogic.getRole({
      id: id
    }).then(function(role) {
      data.role = role;
    }));

    plist.push(eventLogic.getByToday().then(function(event) {
      data.event = event.title;
      data.eventId = event._key;
    }).catch(function(error) {
      data.event = null;
      data.eventId = null;
    }));

    return Promise.all(plist);
  }).then(function() {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
