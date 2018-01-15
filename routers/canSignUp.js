// DEPENDENCIES
const router = require("express").Router();
const util = require("../util/util.js");
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const canSignUpLogic = require("../logic/CanSignUp.js");

// METHODS
router.post("/canSignUp", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  req.checkBody("bool", routerUtil.errors.missingErrorMessage).notEmpty();
  req.body.bool = util.parseBool(req.body.bool);
  return routerUtil.completeRequest(req, res, canSignUpLogic.set,
    "/leadership");
});

// EXPORTS
module.exports = router;
