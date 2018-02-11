// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.leadershipTaskIdsRef;

// METHODS
function add(params) {
  return dbUtil.doTransaction(ref, function(taskIds) {
    taskIds = taskIds || [];
    taskIds = new Set(taskIds);
    taskIds.add(params.id);
    return taskIds;
  });
}

function remove(params) {
  return dbUtil.doTransaction(ref, function(taskIds) {
    taskIds = taskIds || [];
    if (taskIds.length == 0) return taskIds;
    taskIds = new Set(taskIds);
    taskIds.delete(params.id);
    return taskIds;
  });
}

function getAll(params) {
  return dbUtil.getRaw(ref).then(function(taskIds) {
    return taskIds || [];
  });
}

// EXPORTS
module.exports.getAll = getAll;
module.exports.add = add;
module.exports.remove = remove;
