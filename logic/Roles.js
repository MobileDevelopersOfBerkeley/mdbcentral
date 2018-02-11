// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.roleRef;

// METHODS
function getByUid(params) {
  var r = ref.child(params.roleId).child("title");
  return dbUtil.getRaw(r).then(function(title) {
    return title || "NULL";
  }).catch(function(error) {
    return "NULL";
  });
}

function get() {
  return dbUtil.getRaw(ref);
}

// EXPORTS
module.exports.get = get;
module.exports.getByUid = getByUid;
