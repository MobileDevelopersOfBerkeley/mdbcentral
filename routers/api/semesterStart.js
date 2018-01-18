// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase/db.js");
const semesterStartLogic = require("../../logic/SemesterStart.js");

// METHODS
router.post("/semesterStart", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("date", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("date", routerUtil.errors.formatErrorMessage).isValidDate();
  return routerUtil.completeRequest(req, res, semesterStartLogic.set,
    "/leadership");
});

// EXPORTS
module.exports = router;
