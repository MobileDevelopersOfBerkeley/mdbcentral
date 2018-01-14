// DEPENDENCIES
const firebase = require("./fb.js");

// CONSTANTS
const storage = firebase.storage();

// METHODS
function upload(blob) {
  return firebase.storage().bucket()
    .file("uploads/" + blob.filename)
    .upload(blob.path).then(function(data) {
      console.log(data);
      console.log(typeof(data));
      process.exit(0);
    });
}

// EXPORTS
module.exports.upload = upload;
