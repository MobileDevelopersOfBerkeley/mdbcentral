// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.bigLittleRef;
const noContestErr = "no big little contest data";

// METHODS
function get() {
  return dbUtil.getAll(ref).then(function(pairs) {
    if (pairs.length == 0) return Promise.reject(new Error(noContestErr));
    return pairs.sort(function(pair1, pair2) {
      return pair1.points - pair2.points;
    });
  });
}

function set(params) {
  return ref.set(params.leaderboard);
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
