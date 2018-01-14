// DEPENDENCIES
const firebase = require("./fb.js");

// CONSTANTS
const storage = firebase.storage();

// METHODS
function upload(blob) {
  // TODO: ...
  return firebase.storage().bucket().file(bucketPath).upload(blob);
  // return url
}

// EXPORTS
module.exports.upload = upload;
