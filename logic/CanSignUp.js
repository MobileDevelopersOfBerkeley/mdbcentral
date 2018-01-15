// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.canSignUpRef;

// METHODS
function get() {
  return ref.once("value").then(function(snapshot) {
    return snapshot.exists() && snapshot.val() === true;
  });
}

function set(params) {
  return ref.set(params.bool);
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
