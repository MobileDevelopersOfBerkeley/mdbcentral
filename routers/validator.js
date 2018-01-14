// DEPENDENCIES
const expressValidator = require('express-validator');
const isUrl = require('is-url');
const dbUtil = require("../util/firebase/db.js");
const githubUtil = require("../util/github.js");
const getUserById = require("../logic/Users.js").getById;
const config = require("../conf/config.json");

// HELPERS
function _promiseBoolTrue(fn) {
  return new Promise(function(resolve, reject) {
    return fn().then(function(success) {
      if (success) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

// EXPORTS
module.exports = expressValidator({
  customValidators: {
    isValidGithubUsername: function(param) {
      return _promiseBoolTrue(function() {
        return githubUtil.isValidUsername(param)
      });
    },
    isValidFile: function(param) {
      // TODO: ...
      console.log(param);
      console.log(typeof(param));
      process.exit(0);
      return true;
    },
    canSignUp: function(param) {
      return config.canSignUp === true;
    },
    valueLessThan: function(param, value) {
      return param < value;
    },
    valueGreaterThan: function(param, value) {
      return param > value;
    },
    isNonEmptyArray: function(value) {
      return (Array.isArray(value)) && (value.length > 0);
    },
    isValidMajor: function(param) {
      var n = Math.floor(Number(param));
      return n == param && n >= 0 && n < 65535;
    },
    isValidMinor: function(param) {
      var n = Math.floor(Number(param));
      return n == param && n >= 0 && n < 65535;
    },
    keyExistsInDB: function(param, ref) {
      return _promiseBoolTrue(function() {
        return dbUtil.checkIfAllKeysExist(ref, [param]);
      });
    },
    validUserId: function(param) {
      return _promiseBoolTrue(function() {
        return getUserById({
          id: param
        });
      });
    },
    isTrue: function(param) {
      return param == "true";
    },
    isValidNumber: function(param) {
      var num = +param;
      return !isNaN(num);
    },
    isValidNumberArr: function(param) {
      if (!isNonEmptyArray(param)) return false;
      for (var i = 0; i < param.length; i++) {
        var value = param[i];
        if (!isValidNumber(value)) return false;
        param[i] = parseInt(param[i]);
      }
      return true;
    },
    isValidUrl: function(param) {
      return isUrl(param);
    }
  }
});
