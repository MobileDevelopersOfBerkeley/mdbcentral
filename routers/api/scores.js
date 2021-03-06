// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase.js").db;
const scoresLogic = require("../../logic/Scores.js");

// METHODS
router.post("/scores", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("memberId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkBody("memberId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("assignmentId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("assignmentId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.assignmentRef);
  req.checkBody("score", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("score", routerUtil.errors.formatErrorMessage).validScore();
  return routerUtil.completeRequest(req, res, scoresLogic.set,
    "/assignments");
});

router.post("/scores/:id", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkParams("id", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkParams("id", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.scoreRef);
  return routerUtil.completeRequest(req, res, scoresLogic.archive,
    "/assignments");
});

// EXPORTS
module.exports = router;
