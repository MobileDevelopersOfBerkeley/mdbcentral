// DEPENDENCIES
const router = require("express").Router();
const expectedAbsencesRouter = require("./expectedAbsences.js");
const feedbackRouter = require("./feedback.js");
const usersRouter = require("./users.js");
const assignmentsRouter = require("./assignments.js");
const scoresRouter = require("./scores.js");
const finReportRouter = require("./finReports.js");
const leaderRouter = require("./leaders.js");
const eventRouter = require("./events.js");
const semesterStartRouter = require("./semesterStart.js");
const canSignUpRouter = require("./canSignUp.js");
const signInCodeRouter = require("./signInCode.js");
const signInRouter = require("./signIns.js");
const attendanceRouter = require("./attendance.js");

// ROUTES
router.use(signInRouter);
router.use(expectedAbsencesRouter);
router.use(feedbackRouter);
router.use(usersRouter);
router.use(assignmentsRouter);
router.use(scoresRouter);
router.use(finReportRouter);
router.use(leaderRouter);
router.use(eventRouter);
router.use(semesterStartRouter);
router.use(canSignUpRouter);
router.use(signInCodeRouter);
router.use(attendanceRouter);

// EXPORTS
module.exports = router;
