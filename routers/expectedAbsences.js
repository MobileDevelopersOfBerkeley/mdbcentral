// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const expectedAbsencesLogic = require("../logic/ExpectedAbsences.js");

// CONSTANTS
const ref = dbUtil.refs.expectedAbsencesRef;

// METHODS
// NOTE: should be delete but HTML form tag only allows GET and POST
router.post("/expectedAbsences/:id", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkParams("id", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkParams("id", routerUtil.errors.dbErrorMessage).keyExistsInDB(ref);
  return routerUtil.completeRequest(req, res, expectedAbsencesLogic.deleteById,
    "/home");
});

router.post("/expectedAbsences", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("eventId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkCookies("reason", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, expectedAbsencesLogic.create,
    "/calendar");
});

// EXPORTS
module.exports = router;
