// DEPENDENCIES
const expressValidator = require('express-validator');
const isUrl = require('is-url');
const fs = require("fs");
const dbUtil = require("../util/firebase/db.js");
const canSignUp = require("../logic/CanSignUp.js").get;
const util = require("../util/util.js");
const githubUtil = require("../util/github.js");
const memberLogic = require("../logic/Members.js");
const signInCodeLogic = require("../logic/SignInCode.js");
const eventLogic = require("../logic/Events.js");
const config = require("../config.json");

// HELPERS
function _promiseBoolTrue(fn) {
  return new Promise(function(resolve, reject) {
    return fn().then(function(success) {
      if (success) {
        resolve();
      } else {
        reject();
      }
    }).catch(function(error) {
      reject();
    });
  });
}

// EXPORTS
module.exports = expressValidator({
  customValidators: {
    codeIsCorrect: function(param) {
      return _promiseBoolTrue(function() {
        return signInCodeLogic.get().then(function(code) {
          return code == param;
        });
      });
    },
    eventHappening: function(param) {
      return _promiseBoolTrue(function() {
        return eventLogic.getByToday().then(function(event) {
          var startDate = new Date();
          startDate.setTime(event.timestamp);
          var today = new Date();
          return !util.differentDay(today, startDate) && today.getTime() <=
            event.endTimestamp;
        });
      });
    },
    codeIsSet: function(param) {
      return _promiseBoolTrue(function() {
        return signInCodeLogic.get().then(function(code) {
          return code != "" && code.length > 0;
        });
      });
    },
    isLeadership: function(param) {
      return _promiseBoolTrue(function() {
        return memberLogic.isLeadership({
          id: param
        });
      });
    },
    isValidDate: function(param) {
      if (!param || typeof(param) != "string" ||
        param.trim() == "" || param.indexOf("-") < 0)
        return false;
      var x = param.split("-");
      if (x.length != 3) return false;
      if (x[0].length > 2 || x[0].length == 0) return false;
      if (x[1].length > 2 || x[1].length == 0) return false;
      if (x[2].length != 4) return false;
      var isValidNumber = function(param) {
        var num = +param;
        return !isNaN(num);
      }
      return isValidNumber(x[0]) && isValidNumber(x[1]) &&
        isValidNumber(x[2]);
    },
    isValidBool: function(param) {
      return param == "true" || param == "false" ||
        param === true || param === false;
    },
    isValidGithubUsername: function(param) {
      return _promiseBoolTrue(function() {
        return githubUtil.isValidUsername(param)
      });
    },
    isValidFile: function(param) {
      return param && param.path && fs.existsSync(param.path);
    },
    canSignUp: function(param) {
      return _promiseBoolTrue(function() {
        return canSignUp();
      });
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
    isTrue: function(param) {
      return param == "true";
    },
    isValidNumber: function(param) {
      var num = +param;
      return !isNaN(num);
    },
    isValidNumberArr: function(param) {
      var isValidNumber = function(param) {
        var num = +param;
        return !isNaN(num);
      }
      if (!Array.isArray(param) || param.length == 0) return false;
      for (var i = 0; i < param.length; i++) {
        var value = param[i];
        if (!isValidNumber(value)) return false;
        param[i] = parseFloat(param[i]);
      }
      return true;
    },
    isValidUrl: function(param) {
      return isUrl(param);
    }
  }
});
