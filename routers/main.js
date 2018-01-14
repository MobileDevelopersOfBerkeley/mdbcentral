// DEPENDENCIES
const router = require("express").Router();
const slackRouter = require("./slack.js");
const webRouter = require("./web.js");

// SETUP
router.use(slackRouter);
router.use(webRouter);

// EXPORTS
module.exports = router;
