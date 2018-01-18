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
router.use(calendarRouter);
router.use(financialRouter);
router.use(homeRouter);
router.use(leadershipRouter);
router.use(loginRouter);
router.use(policiesRouter);
router.use(profileRouter);

// EXPORTS
module.exports = router;
