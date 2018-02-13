// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const util = require("../../util/util.js");
const dbUtil = require("../../util/firebase.js").db;
const eventLogic = require("../../logic/Events.js");

// METHODS
router.post("/events", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("title", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("startDate", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("endDate", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("startTime", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("endTime", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("attendance", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("attendance", routerUtil.errors.formatErrorMessage).isValidBool();
  req.body.attendance = util.parseBool(req.body.attendance);
  return routerUtil.completeRequest(req, res, eventLogic.create,
    "/calendar");
});

router.post("/events/:id", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkParams("id", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkParams("id", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.eventsRef);
  return routerUtil.completeRequest(req, res, eventLogic.deleteById,
    "/calendar");
});

// EXPORTS
module.exports = router;
