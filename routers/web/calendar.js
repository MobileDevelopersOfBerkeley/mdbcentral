// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const semesterStartLogic = require("../../logic/SemesterStart.js");

// METHODS
router.get("/calendar", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  helper.genData("calendar", member).then(function(data) {
    return semesterStartLogic.get().then(function(semesterStart) {
      // TODO: implement this w/o Welcome API
      return Promise.resolve([]);
      // return welcomeLogic.getEventsSoFar(semesterStart);
    }).then(function(events) {
      data.events = events;
      // TODO: implement this w/o Welcome API
      return Promise.resolve(null);
      // return welcomeLogic.getEvent().catch(function(error) {
      //   return null;
      // });
    }).then(function(event) {
      if (event) data.closestEventId = event.id;
      else data.closestEventId = null;
      res.render("index", data);
    });
  });
});

// EXPORTS
module.exports = router;
