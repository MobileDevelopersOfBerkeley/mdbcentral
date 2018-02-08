// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.finReportRef;

// METHODS
function create(params) {
  return dbUtil.createByAutoKey(ref, {
    desc: params.desc,
    date: params.date,
    dollars: params.dollars,
    category: params.category,
    projection: params.projection
  });
}

function getAll() {
  return dbUtil.getAll(ref);
}

function deleteById(params) {
  return dbUtil.deleteByKey(ref, params.id);
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
module.exports.deleteById = deleteById;
