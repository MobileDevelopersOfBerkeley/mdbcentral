// DEPENDENCIES
const githubUtil = require("../util/github.js");
const dbUtil = require("../util/firebase/db.js");

// CONSTANTS
const ref = dbUtil.refs.githubCacheRef;

// METHODS
function update() {
  return githubUtil.getCache().then(function(cache) {
    return ref.set(JSON.stringify(cache, null, 2));
  });
}

// EXPORTS
module.exports.update = update;
