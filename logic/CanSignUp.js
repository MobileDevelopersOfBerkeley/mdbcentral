// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.canSignUpRef;

// METHODS
function get() {
  return dbUtil.getRaw(ref).then(function(bool) {
    return bool != null && bool === true;
  });
}

function set(params) {
  return dbUtil.setRaw(ref, params.bool);
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
