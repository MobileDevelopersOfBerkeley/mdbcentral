// DEPENDENCIES
const router = require("express").Router();
const slackRouter = require("./slack.js");

// SETUP
router.use(slackRouter);

// EXPORTS
module.exports = router;
