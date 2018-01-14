// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const expectedAbsencesLogic = require("../logic/ExpectedAbsences.js");

// CONSTANTS
const ref = dbUtil.refs.expectedAbsencesRef;

// METHODS
router.delete("/expectedAbsences/:id", function(req, res) {
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("userId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.userRef);
  req.checkParams("id", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkParams("id", routerUtil.errors.dbErrorMessage).keyExistsInDB(ref);
  return routerUtil.completeRequest(req, res, expectedAbsencesLogic.deleteById,
    "/home");
});

router.post("/expectedAbsences", function(req, res) {
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("userId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.userRef);
  req.checkBody("eventId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkCookies("reason", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, expectedAbsencesLogic.create,
    "/calendar");
});

// EXPORTS
module.exports = router;
