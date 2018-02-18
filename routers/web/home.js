// DEPENDENCIES
const router = require("express").Router();
const util = require("../../util/util.js");
const helper = require("../helper.js");
const memberLogic = require("../../logic/Members.js");
const expectedAbsencesLogic = require("../../logic/ExpectedAbsences.js");
const eventLogic = require("../../logic/Events.js");
const signInLogic = require("../../logic/SignIns.js");
const canSignUpLogic = require("../../logic/CanSignUp.js");
const config = require("../../config.json");

// CONSTANTS
const newMaxAbsences = config.newMaxAbsences;
const oldMaxAbsences = config.oldMaxAbsences;

// HELPERS
function _getCanSignUp(data) {
  return canSignUpLogic.get().then(function(bool) {
    data.canSignUp = bool;
  });
}

function _getRole(data, id) {
  return memberLogic.getRole({
    id: id
  }).then(function(role) {
    data.role = role;
  });
}

function _getEvent(data) {
  return eventLogic.getByToday().then(function(event) {
    data.event = event.title;
    data.eventId = event._key;
  }).catch(function(error) {
    data.event = null;
    data.eventId = null;
  });
}

function _getAttendance(data, id) {
  return expectedAbsencesLogic.getByUid({
    member: id
  }).then(function(expectedAbsences) {
    data.expectedAbsences = expectedAbsences;
    num_expected = expectedAbsences.length;
    return signInLogic.getAllAttendance();
  }).then(function(a) {
    var attendance = a[id];
    data.absences = attendance.absences;
    data.signins = attendance.signIns;
    data.maxAbsences = data.user.newMember === true ?
      newMaxAbsences : oldMaxAbsences;

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
    data.attendances = attendances.sort(function(a, b) {
      return a.timestamp - b.timestamp;
    });
  });
}

// METHODS
router.get("/", function(req, res) {
  res.redirect("/home");
});

router.get("/home", helper.isLoggedIn, function(req, res) {
  var id = req.cookies.member;
  var data;
  helper.genData("home", id).then(function(d) {
    data = d;
    return Promise.all([
      _getCanSignUp(data),
      _getRole(data, id),
      _getEvent(data),
      _getAttendance(data, id)
    ]);
  }).then(function() {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
