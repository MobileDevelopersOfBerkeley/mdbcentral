// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase.js").db;
const signInCodeLogic = require("../../logic/SignInCode.js");

// METHODS
router.post("/signInCode", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("code", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, signInCodeLogic.set,
    "/leadership");
});

// EXPORTS
module.exports = router;
