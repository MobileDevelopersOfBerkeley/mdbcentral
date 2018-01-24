// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const util = require("../../util/util.js");
const dbUtil = require("../../util/firebase/db.js");
const finReportLogic = require("../../logic/FinReports.js");

// METHODS
router.get("/finReports", function(req, res) {
  req.checkHeaders("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkHeaders("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkHeaders("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  return routerUtil.completeRequest(req, res, finReportLogic.getAll);
});

router.post("/finReports", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("dollars", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("dollars", routerUtil.errors.missingErrorMessage).isValidNumber();
  req.body.dollars = parseFloat(req.body.dollars);
  req.checkBody("desc", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("date", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("category", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("projection", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("projection", routerUtil.errors.formatErrorMessage).isValidBool();
  req.body.projection = util.parseBool(req.body.projection);
  return routerUtil.completeRequest(req, res, finReportLogic.create,
    "/financial");
});

router.post("/finReports/:id", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkParams("id", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkParams("id", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.finReportRef);
  return routerUtil.completeRequest(req, res, finReportLogic.deleteById,
    "/financial");
});

// EXPORTS
module.exports = router;
