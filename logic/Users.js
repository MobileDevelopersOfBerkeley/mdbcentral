// DEPENDENCIES
const dbUtil = require("../../util/firebase/db.js");
const githubUtil = require("../../util/github.js");

// CONSTANTS
const ref = dbUtil.refs.userRef;

// METHODS
function getById(params) {
  var id = params.id;
  return dbutil.getByKey(ref, id);
}

function updateEffortRatings() {
  return dbUtil.refs.githubCacheRef.once("value").then(function(snapshot) {
    var cache = JSON.parse(snapshot.val());
    var usernameToEffortRating = githubUtil.listEffortRatings(cache);
    return Promise.all(Object.keys(usernameToEffortRating)
      .map(function(username) {
        var effortRating = usernameToEffortRating[username];
        return dbUtil.getObjectsByFields(ref, {
          githubUsername: username
        }).then(function(user) {
          return dbUtil.updateObject(ref, user._key, {
            effortRating: effortRating
          });
        });
      }));
  });
}

// EXPORTS
module.exports.getById = getById;
module.exports.updateEffortRatings = updateEffortRatings;
