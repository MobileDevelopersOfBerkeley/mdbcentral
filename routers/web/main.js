// DEPENDENCIES
const router = require("express").Router();
const assignmentRouter = require("./assignments.js");
const calendarRouter = require("./calendar.js");
const financialRouter = require("./financial.js");
const homeRouter = require("./home.js");
const leadershipRouter = require("./leadership.js");
const loginRouter = require("./login.js");
const policiesRouter = require("./policies.js");
const profileRouter = require("./profile.js");

// ROUTES
router.use(assignmentRouter);

// EXPORTS
module.exports = router;
