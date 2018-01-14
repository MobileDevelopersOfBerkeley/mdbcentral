// DEPENDENCIES
const jwt = require("jsonwebtoken");
const config = require("../conf/config.json");

// METHODS
function getToken(params) {
  var token = jwt.sign({
    id: params.id
  }, config.jwtSecret, {
    expiresIn: config.jwtExpireTime
  });
  return Promise.resolve(token);
}

function auth(params) {
  return new Promise(function(resolve, reject) {
    jwt.verify(params.token, config.jwtSecret, function(err, decoded) {
      if (err)
        reject("Forbidden");
      else
        resolve(true);
    });
  });
}

// EXPORTS
module.exports.getToken = getToken;
module.exports.auth = auth;
