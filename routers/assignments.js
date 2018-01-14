// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const assignmentLogic = require("../logic/Assignments.js");

// METHODS
router.post("/assignments", function(req, res) {
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("userId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.userRef);
  req.checkBody("due", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("link", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("link", routerUtil.errors.formatErrorMessage).isValidUrl();
  req.checkBody("name", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleIds", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleIds", routerUtil.errors.formatErrorMessage).isValidNumberArr();
  return routerUtil.completeRequest(req, res, assignmentLogic.create,
    "/leadership");
});

// EXPORTS
module.exports = router;
