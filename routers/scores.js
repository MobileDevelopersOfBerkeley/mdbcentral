// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const scoresLogic = require("../logic/Scores.js");

// METHODS
router.patch("/scores", function(req, res) {
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("userId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("assignmentId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("assignmentId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.assignmentRef);
  req.checkBody("score", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("score", routerUtil.errors.formatErrorMessage).isValidNumber();
  return routerUtil.completeRequest(req, res, scoresLogic.set,
    "/leadership");
});

// EXPORTS
module.exports = router;
