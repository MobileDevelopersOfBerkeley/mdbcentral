// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const finReportLogic = require("../logic/FinReports.js");

// METHODS
router.post("/finReports", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("dollars", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("dollars", routerUtil.errors.missingErrorMessage).isValidNumber();
  req.body.dollars = parseInt(req.body.dollars);
  req.checkBody("desc", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("date", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("category", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, finReportLogic.create,
    "/financial");
});

// EXPORTS
module.exports = router;
