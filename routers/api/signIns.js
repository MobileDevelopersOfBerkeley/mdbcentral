// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase.js").db;
const signInLogic = require("../../logic/SignIns.js");

// METHODS
router.post("/signIns", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("code", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("code", routerUtil.errors.codeNotSetMessage).codeIsSet();
  req.checkBody("code", routerUtil.errors.eventNotHappeningMessage).eventHappening();
  req.checkBody("code", routerUtil.errors.valueInCorrectMessage).codeIsCorrect();
  return routerUtil.completeRequest(req, res, signInLogic.create, "/home");
});

router.post("/signIns/manual", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("id", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("id", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("eventId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("eventId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.eventRef);
  req.body.code = "manual";
  req.body.member = req.body.id;
  return routerUtil.completeRequest(req, res, signInLogic.createManual,
    "/attendance");
});

// EXPORTS
module.exports = router;
