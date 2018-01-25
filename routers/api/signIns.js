// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase/db.js");
const signInLogic = require("../../logic/SignIns.js");

// METHODS
router.post("/signIns", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("code", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("code", routerUtil.errors.codeNotSetMessage).codeIsSet();
  req.checkBody("code", routerUtil.errors.eventNotHappeningMessage).eventHappening();
  req.checkBody("code", routerUtil.errors.valueInCorrectMessage).codeIsCorrect();
  return routerUtil.completeRequest(req, res, signInLogic.create, "/home");
});

// EXPORTS
module.exports = router;
