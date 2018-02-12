// DEPENDENCIES
var schedule = require('node-schedule');

// METHODS
function runOnceADay(hourOfDay, fn) {
  schedule.scheduleJob("0 " + hourOfDay + " * * *", fn);
}

// EXPORTS
module.exports.runOnceADay = runOnceADay;
