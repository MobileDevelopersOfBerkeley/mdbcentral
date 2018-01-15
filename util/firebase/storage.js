// DEPENDENCIES
const firebase = require("./fb.js");

// CONSTANTS
const storage = firebase.storage();

// METHODS
function upload(blob) {
  var link;
  return storage.bucket().upload(blob.path)
    .then(function(data) {
      var d = data[0];
      link = d.metadata.mediaLink;
      return d.makePublic();
    }).then(function() {
      return link;
    });
}

// EXPORTS
module.exports.upload = upload;
