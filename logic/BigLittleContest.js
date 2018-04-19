// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;

// CONSTANTS
const ref = dbUtil.refs.bigLittleRef;
const noContestErr = "no big little contest data";

// METHODS
function get(params) {
  return dbUtil.getAll(ref).then(function(pairs) {
    if (pairs.length == 0) return Promise.reject(new Error(noContestErr));
    if (!params || params.sorted !== true) return pairs;
    return pairs.sort(function(pair1, pair2) {
      return pair2.points - pair1.points;
    });
  });
}

function set(params) {
  return dbUtil.setRaw(ref, params.leaderboard);
}

function create(params) {
  return dbUtil.createByAutoKey(ref, {
    name: params.name,
    points: 0,
  });
}

function updateNames(params) {
  return get().then(function(pairs) {
    params.names.forEach(function(name, i, arr) {
      var pair = pairs[i];
      pair.name = name;
    });
    return set({
      leaderboard: pairs
    });
  });
}

function updatePoints(params) {
  return get().then(function(pairs) {
    params.points.forEach(function(points, i, arr) {
      var pair = pairs[i];
      pair.points = points;
    });
    return set({
      leaderboard: pairs
    });
  });
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
module.exports.create = create;
module.exports.updateNames = updateNames;
module.exports.updatePoints = updatePoints;
