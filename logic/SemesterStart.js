// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.semesterStartRef;

// METHODS
function get() {
  return dbUtil.getRaw(ref).then(function(start) {
    if (!start) return Promise.reject(new Error("no date set"));
    return start;
  });
}

function set(params) {
  return dbUtil.setRaw(ref, params.date);
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
