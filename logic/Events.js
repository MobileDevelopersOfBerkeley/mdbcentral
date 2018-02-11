// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;
const getUnixTS = require("../util/util.js").getUnixTS;

// CONSTANTS
const ref = dbUtil.refs.eventsRef;
const todayEventErr = "Could not find event that takes attendance";

// HELPERS
function _getTimestamp(dateStr, timeStr) {
  return new Date(dateStr + " " + timeStr + " PST").getTime();
}

// METHODS
function create(params) {
  return dbUtil.createByAutoKey(ref, {
    attendance: params.attendance,
    timestamp: _getTimestamp(params.startDate, params.startTime),
    title: params.title,
    endTimestamp: _getTimestamp(params.endDate, params.endTime),
  });
}

function deleteById(params) {
  return dbUtil.deleteByKey(ref, params.id);
}

function getAll() {
  return dbUtil.getAll(ref);
}

function getByToday() {
  var today = getUnixTS();
  return getAll().then(function(events) {;
    var data = events.reduce(function(tuple, currE) {
      var e = tuple[0];
      var diff = tuple[1];
      var currDiff = Math.abs(currE.timestamp - today);
      if (!e || currDiff < diff) return [currE, currDiff];
      return tuple;
    }, [null, Number.MAX_VALUE]);
    if (data[0] != null && data[0].attendance === true) return data[0];
    return Promise.reject(new Error(todayEventErr));
  });
}

function getById(params) {
  return dbUtil.getByKey(ref, params.id);
}

// EXPORTS
module.exports.deleteById = deleteById;
module.exports.getById = getById;
module.exports.getByToday = getByToday;
module.exports.getAll = getAll;
module.exports.create = create;
