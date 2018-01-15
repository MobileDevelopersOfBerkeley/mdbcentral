// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.semesterStartRef;

// METHODS
function get() {
  return ref.once("value").then(function(snapshot) {
    if (!snapshot.exists()) return Promise.reject(new Error("no date set"));
    return snapshot.val();
  });
}

function set(params) {
  return ref.set(params.date);
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
