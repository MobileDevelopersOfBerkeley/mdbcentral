// DEPENDENCIES
const request = require("request");
const config = require("../config.json");

// METHODS
function promisifyRequest(url, params) {
  var options = {
    url: url,
    method: "GET",
    headers: {
      'User-Agent': config.userAgent,
    }
  };
  if (params) {
    options.method = "POST";
    options.json = true;
    options.form = params;
  }
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) reject(error);
      else if (response.error) reject(response.error);
      else if (body.error) reject(body.error);
      else if (response.statusCode && String(response.statusCode).charAt(
          0) != "2") reject(body);
      else resolve(body);
    });
  });
}

// EXPORTS
module.exports.promisifyRequest = promisifyRequest;
