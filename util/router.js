// DEPENDENCIES
const auth = require("./auth.js").auth;

// CONSTANTS
const errors = {
  rangeErrorMessage: "Invalid range for param",
  formatErrorMessage: "Invalid param format",
  missingErrorMessage: "Missing or empty param",
  dbErrorMessage: "Object with id specified not found in the database",
  invalidAuthMessage: "Invalid Authenication Id"
};

// HELPERS
function _sendRes(res, status, result, error) {
  res.status(status).json({
    status: status,
    result: result,
    error: error
  });
}

// HELPERS
function _aggregateParams(req) {
  var allParams = {};
  for (var key in req.query) {
    if (req.query[key] != null) {
      allParams[key] = req.query[key];
    }
  }
  for (var key in req.body) {
    if (req.body[key] != null) {
      allParams[key] = req.body[key];
    }
  }
  for (var key in req.params) {
    if (req.params[key] != null) {
      allParams[key] = req.params[key];
    }
  }
  return allParams;
}

// METHODS
function completeRequest(req, res, func, noAuth) {
  var p = Promise.resolve(true);
  if (!noAuth) {
    var token = req.headers['x-access-token'];
    if (!token) {
      _sendRes(res, 401, null, "Need to set x-access-token header");
      return;
    }
    p = auth({
      token: token
    });
  }
  return p.then(function(authed) {
    if (authed !== true) {
      _sendRes(res, 403, null, "Forbidden");
      return;
    }
    return req.getValidationResult().then(function(result) {
      if (!result.isEmpty()) {
        _sendRes(res, 400, null, result.array());
        return;
      }
      return func(_aggregateParams(req)).then(function(result) {
        _sendRes(res, 200, result, null);
      }).catch(function(error) {
        _sendRes(res, 500, null, error.toString());
      });
    });
  }).catch(function(error) {
    _sendRes(res, 403, null, error);
  });
}

function rejectRequest(req, res) {
  return completeRequest(req, res, function(params) {
    return Promise.reject(new Error("Could not clasify your request."));
  });
}

// EXPORTS
module.exports.errors = errors;
module.exports.completeRequest = completeRequest;
module.exports.rejectRequest = rejectRequest;
