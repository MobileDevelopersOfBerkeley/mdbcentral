// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const feedbackLogic = require("../logic/Feedback.js");

// METHODS
router.post("/feedback", function(req, res) {
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("userId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.userRef);
  req.checkBody("eventId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkCookies("response", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, feedbackLogic.create,
    "/calendar");
});

// EXPORTS
module.exports = router;
