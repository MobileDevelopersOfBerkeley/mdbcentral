// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const dbUtil = require("../../util/firebase.js").db;
const signInLogic = require("../../logic/SignIns.js");

// METHODS
router.get("/attendance/:name?/:title?", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkCookies("member", routerUtil.errors.notLeadershipMessage).isLeadership();
  if (req.query.name) {
    req.checkQuery("name", routerUtil.errors.missingErrorMessage).notEmpty();
    return routerUtil.completeRequest(req, res, signInLogic.getAttendanceByName);
  } else if (req.query.title) {
    return routerUtil.completeRequest(req, res, signInLogic.getAttendanceByEvent);
  }
  return routerUtil.completeRequest(req, res, signInLogic.getAllAttendance);
});

// EXPORTS
module.exports = router;
