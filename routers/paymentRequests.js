// DEPENDENCIES
const router = require("express").Router();
const multer = require('multer');
const dbUtil = require("../util/firebase/db.js");
const routerUtil = require("../util/router.js");
const paymentRequestLogic = require("../logic/paymentRequests.js");
const stripeUtil = require("../util/stripe.js");

// CONSTANTS
const ref = dbUtil.refs.paymentRequestRef;
const upload = multer({
  dest: '/tmp/'
});

// METHODS
router.post("/paymentRequests", upload.single("image"), function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkBody("dollars", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("dollars", routerUtil.errors.formatErrorMessage).isValidNumber();
  req.body.dollars = parseFloat(req.body.dollars);
  req.checkBody("message", routerUtil.errors.missingErrorMessage).notEmpty();
  if (req.body.charge) {
    req.checkBody("members", routerUtil.errors.missingErrorMessage).notEmpty();
    req.checkBody("members", routerUtil.errors.formatErrorMessage).isNonEmptyArray();
    return routerUtil.completeRequest(req, res, paymentRequestLogic.createChargeRequest,
      "/leadership");
  }
  req.body.image = req.file;
  req.checkBody("image", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("image", routerUtil.errors.missingErrorMessage).isValidFile();
  return routerUtil.completeRequest(req, res, paymentRequestLogic.createReimbursementRequest,
    "/leadership");
});

router.post("/paymentRequests/:id", function(req, res) {
  req.checkCookies("member", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("member", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(dbUtil.refs.memberRef);
  req.checkParams("id", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkParams("id", routerUtil.errors.dbErrorMessage).keyExistsInDB(ref);
  if (req.body.reimbursement) {
    return routerUtil.completeRequest(req, res, paymentRequestLogic.completeReimbursement,
      "/leadership");
  }
  return routerUtil.completeRequest(req, res, paymentRequestLogic.completeCharge,
    "/home");
});

// EXPORTS
module.exports = router;
