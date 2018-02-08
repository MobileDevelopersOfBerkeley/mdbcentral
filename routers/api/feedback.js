// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase.js").db;
const feedbackLogic = require("../../logic/Feedback.js");

// METHODS
router.post("/feedback", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("eventId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("response", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, feedbackLogic.create,
    "/calendar");
});

// EXPORTS
module.exports = router;
