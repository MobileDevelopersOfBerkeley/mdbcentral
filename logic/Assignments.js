// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.assignmentRef;

// METHODS
function create(params) {
  return dbUtil.createByAutoKey(ref, {
    due: params.due,
    link: params.link,
    name: params.name,
    roleIds: params.roleIds
  });
}

function getAll(params) {
  return dbUtil.getAll(ref);
}

// EXPORTS
module.exports.getAll = getAll;
module.exports.create = create;
