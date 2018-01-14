// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../../util/router.js");
const slackUtil = require("../util/slack.js");

// METHODS
router.post("/slack", function(req, res) {
  req.checkBody("channel", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("message", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, function(params) {
    return slack.send(params.channel, params.message);
  }, true);
});

// EXPORTS
module.exports = router;
