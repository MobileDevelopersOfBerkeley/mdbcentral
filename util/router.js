// CONSTANTS
const errors = {
  rangeErrorMessage: "Invalid range for param",
  formatErrorMessage: "Invalid param format",
  missingErrorMessage: "Missing or empty param",
  dbErrorMessage: "Object with id specified not found in the database",
  invalidAuthMessage: "Invalid Authenication Id",
  notLoggedInMessage: "No user is logged in",
  canNotSignUpMessage: "No users are allowed to sign up at this time",
  usernameNotExistMessage: "Username does not exist"
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

  function helper(field) {
    for (var key in req[field]) {
      if (req[field][key] != null) {
        allParams[key] = req[field][key];
      }
    }
  }

  helper("query");
  helper("body");
  helper("params");
  helper("cookies");
  return allParams;
}

// METHODS
function completeRequest(req, res, func, redirect) {
  return req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      _sendRes(res, 400, null, result.array());
      return;
    }
    return func(_aggregateParams(req)).then(function(result) {
      if (!redirect) _sendRes(res, 200, result, null);
    }).catch(function(error) {
      if (!redirect) _sendRes(res, 500, null, error.toString());
    }).then(function() {
      if (redirect) res.redirect(redirect);
    });
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
