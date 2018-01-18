// DEPENDENCIES
const router = require("express").Router();
const util = require("../../util/util.js");
const helper = require("../helper.js");
const memberLogic = require("../../logic/Members.js");
const paymentRequestLogic = require("../../logic/PaymentRequests.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const welcomeLogic = require("../../logic/Welcome.js");

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
    var num_absences = 0;
    var num_expected = 0;

    plist.push(paymentRequestLogic.getByMember({
      member: id
    }).then(function(requests) {
      data.requests = requests;
    }));

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
        signin.date = util.dateToString(date);
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
        var date = new Date();
        date.setTime(expectedAbsence.timestamp);
        expectedAbsence.date = util.dateToString(date);
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

// EXPORTS
module.exports = router;
