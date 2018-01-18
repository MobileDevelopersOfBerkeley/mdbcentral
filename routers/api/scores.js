// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase/db.js");
const scoresLogic = require("../../logic/Scores.js");

// METHODS
router.post("/scores", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("assignmentId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("assignmentId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.assignmentRef);
  req.checkBody("score", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, scoresLogic.set,
    "/leadership");
});

// EXPORTS
module.exports = router;
