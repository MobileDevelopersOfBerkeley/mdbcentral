// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.finReportRef;

// METHODS
function create(params) {
  return dbUtil.createNewObjectByAutoId(ref, {
    desc: params.desc,
    date: params.date,
    dollars: params.dollars,
    category: params.category
  });
}

function getAll() {
  return dbUtil.getAll(ref);
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
