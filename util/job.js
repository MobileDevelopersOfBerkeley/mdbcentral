// DEPENDENCIES
const util = require("./util.js");

// METHODS
function run(fn, initLabel, successLabel) {
  var start = new Date();
  console.log(initLabel);
  fn().then(function() {
    console.log("Success: ", successLabel);
  }).catch(function(error) {
    console.error("Error: ", error);
  }).then(function() {
    var seconds = util.secondsApart(start, new Date());
    console.log("Elapsed Time: ", seconds, "seconds");
  });
}

// EXPORTS
module.exports.run = run;
