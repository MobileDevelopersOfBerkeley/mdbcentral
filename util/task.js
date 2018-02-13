// DEPENDENCIES
var schedule = require('node-schedule');

// METHODS
function runOnceADay(hourOfDay, fn) {
  schedule.scheduleJob("0 " + hourOfDay + " * * *", function() {
    return fn().catch(function(error) {});
  });
}

// EXPORTS
module.exports.runOnceADay = runOnceADay;
