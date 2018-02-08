// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase.js").db;
const assignmentLogic = require("../../logic/Assignments.js");

// METHODS
router.post("/assignments", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("due", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("link", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("link", routerUtil.errors.formatErrorMessage).isValidUrl();
  req.checkBody("name", routerUtil.errors.missingErrorMessage).notEmpty();
  var type = typeof(req.body.roleIds);
  if (type == "number" || type == "string") req.body.roleIds = [req.body.roleIds];
  req.checkBody("roleIds", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleIds", routerUtil.errors.formatErrorMessage).isValidNumberArr();
  return routerUtil.completeRequest(req, res, assignmentLogic.create,
    "/leadership");
});

// EXPORTS
module.exports = router;
