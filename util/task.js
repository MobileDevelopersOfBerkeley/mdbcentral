// DEPENDENCIES
const schedule = require('node-schedule-tz');
const config = require("../config.json");

// METHODS
function runOnceADay(hourOfDay, fn) {
  if (config.startJobsOnBoot === true) fn();
  schedule.scheduleJob("0 " + hourOfDay + " * * *", "America/Los_Angeles", fn);
}

// EXPORTS
module.exports.runOnceADay = runOnceADay;
