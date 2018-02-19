// DEPENDENCIES
const stats = require("stats-lite");
const githubUtil = require("../util/github.js");
const dbUtil = require("../util/firebase.js").db;
const config = require("../config.json");

// CONSTANTS
const ref = dbUtil.refs.githubCacheRef;
const org_id = config.githubOrgId;
const effortRating_3_lines = 1000;

// HELPERS
function _setEffortRatings(cache) {
  cache.effortRatings = {};
  Object.keys(cache.repoStats).forEach(function(repo_name) {
    var usernameToLines = cache.repoStats[repo_name];
    var values = Object.keys(usernameToLines).map(function(username) {
      return usernameToLines[username];
    });
    var effortRating_1 = stats.percentile(values, 0.1);
    var effortRating_2 = stats.percentile(values, 0.3);
    var effortRating_3 = stats.percentile(values, 0.5);
    var effortRating_4 = stats.percentile(values, 0.7);
    Object.keys(usernameToLines).forEach(function(username) {
      var lines = usernameToLines[username];
      var effortRating = undefined;
      if (lines <= effortRating_1) effortRating = 1;
      else if (lines <= effortRating_2) effortRating = 2;
      else if (lines <= effortRating_3) effortRating = 3;
      else if (lines <= effortRating_4) effortRating = 4;
      else effortRating = 5;
      if (lines >= effortRating_3_lines && effortRating < 3)
        effortRating = 3;
      if (Object.keys(cache.effortRatings).indexOf(username) < 0)
        cache.effortRatings[username] = 0;
      cache.effortRatings[username] =
        Math.max(cache.effortRatings[username], effortRating);
    });
  });
  return cache;
}

// METHODS
function get() {
  return dbUtil.getRaw(ref).then(function(cache) {
    if (!cache) return {};
    cache = JSON.parse(cache);
    return _setEffortRatings(cache);
  });
}

function set() {
  return githubUtil.getStats(org_id).then(function(stats) {
    return dbUtil.setRaw(ref, JSON.stringify(stats));
  }).catch(function(error) {
    return Promise.reject(new Error(
      "Most likeley usage limit exceed for Github API"));
  });
}

// EXPORTS
module.exports.get = get;
module.exports.set = set;
