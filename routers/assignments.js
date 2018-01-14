// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const assignmentLogic = require("../logic/Assignments.js");

// METHODS
router.post("/assignments", function(req, res) {
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkBody("due", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("link", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("link", routerUtil.errors.formatErrorMessage).isValidUrl();
  req.checkBody("name", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleIds", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleIds", routerUtil.errors.formatErrorMessage).isValidNumberArr();
  routerUtil.completeRequest(req, res, assignmentLogic.create,
    "/leadership");
});

// EXPORTS
module.exports = router;
