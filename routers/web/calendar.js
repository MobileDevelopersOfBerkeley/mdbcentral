// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const semesterStartLogic = require("../../logic/SemesterStart.js");
const eventLogic = require("../../logic/Events.js");
const feedbackLogic = require("../../logic/Feedback.js");

// HELPERS
function _getClosestEventId(data) {
  return eventLogic.getByToday().catch(function(error) {
    return null;
  }).then(function(event) {
    if (event) data.closestEventId = event.id;
    else data.closestEventId = null;
  });
}

function _getFeedback(data) {
  return feedbackLogic.getAll().then(function(feedbacks) {
    data.feedbacks = feedbacks;
  });
}

function _getSemesterStart(data) {
  return semesterStartLogic.get().then(function(semesterStart) {
    data.semesterStart = semesterStart;
  });
}

// METHODS
router.get("/calendar", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  var data;
  helper.genData("calendar", member).then(function(dat) {
    data = dat;
    return Promise.all([
      _getClosestEventId(data),
      _getFeedback(data),
      _getSemesterStart(data)
    ]);
  }).then(function() {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
