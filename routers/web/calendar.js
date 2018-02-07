// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const semesterStartLogic = require("../../logic/SemesterStart.js");
const eventLogic = require("../../logic/Events.js");
const feedbackLogic = require("../../logic/Feedback.js");

// METHODS
router.get("/calendar", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  var data;
  helper.genData("calendar", member).then(function(dat) {
    data = dat;
    return semesterStartLogic.get().then(function(semesterStart) {
      return eventLogic.getByToday().catch(function(error) {
        return null;
      });
    }).then(function(event) {
      if (event) data.closestEventId = event.id;
      else data.closestEventId = null;
      return feedbackLogic.getAll();
    }).then(function(feedbacks) {
      data.feedbacks = feedbacks;
      var plist = [];
      plist.push(eventLogic.getByToday().then(function(event) {
        data.closestEventId = event._key
      }).catch(function(error) {
        data.closestEventId = null;
      }));
      plist.push(semesterStartLogic.get().then(function(
        semesterStart) {
        data.semesterStart = semesterStart;
      }));
      return Promise.all(plist);
    });
  }).then(function() {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
