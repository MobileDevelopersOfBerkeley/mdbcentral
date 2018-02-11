// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase.js").db;
const bigLittleLogic = require("../../logic/BigLittleContest.js");

// METHODS
router.post("/bigLittle/names", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("names", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("names", routerUtil.errors.formatErrorMessage).isNonEmptyArray();
  return routerUtil.completeRequest(req, res, bigLittleLogic.updateNames,
    "/bigLittle");
});

router.post("/bigLittle/points", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("points", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("points", routerUtil.errors.formatErrorMessage).isNonEmptyArray();
  req.checkBody("points", routerUtil.errors.formatErrorMessage).isValidNumberArr();
  return routerUtil.completeRequest(req, res, bigLittleLogic.updatePoints,
    "/bigLittle");
});

// EXPORTS
module.exports = router;
