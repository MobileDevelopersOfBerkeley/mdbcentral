// DEPENDENCIES
var schedule = require('node-schedule-tz');

// METHODS
function runOnceADay(hourOfDay, fn) {
  schedule.scheduleJob("0 " + hourOfDay + " * * *", "America/Los_Angeles", fn);
}

// EXPORTS
module.exports.runOnceADay = runOnceADay;
