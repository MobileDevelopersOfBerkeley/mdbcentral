// DEPENDENCIES
const router = require("express").Router();
const webRouter = require("./web/main.js");
const apiRouter = require("./api/main.js");

// ROUTES
router.use(webRouter);
router.use(apiRouter);

// EXPORTS
module.exports = router;
