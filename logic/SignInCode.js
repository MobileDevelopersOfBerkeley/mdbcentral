// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.signInCodeRef;

// METHODS
function get() {
  return ref.once("value").then(function(snapshot) {
    return snapshot.val() || "";
  });
}

function set(params) {
  return ref.set(params.code);
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
