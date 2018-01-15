// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.roleRef;

// METHODS
function getByUid(params) {
  return ref.child(params.roleId).child("title").once("value")
    .then(function(snapshot) {
      if (!snapshot.exists()) return "NULL";
      return snapshot.val();
    }).catch(function(error) {
      return "NULL";
    });
}

function get() {
  return ref.once("value").then(function(snapshot) {
    return snapshot.val();
  });
}

// EXPORTS
module.exports.get = get;
module.exports.getByUid = getByUid;
