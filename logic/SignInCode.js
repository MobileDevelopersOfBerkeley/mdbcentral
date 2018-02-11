// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.signInCodeRef;

// METHODS
function get() {
  return dbUtil.getRaw(ref).then(function(code) {
    return code || "";
  });
}

function set(params) {
  return dbUtil.setRaw(ref, params.code);
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
