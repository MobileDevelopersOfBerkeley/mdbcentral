// DEPENDENCIES
const multer = require('multer');
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const util = require("../util/util.js");
const usersLogic = require("../logic/Members.js");

// CONSTANTS
const ref = dbUtil.refs.memberRef;
const upload = multer({
  dest: '/tmp/'
});

// HELPERS
function _doCreate(req, res) {
  req.body.profileImage = req.file;
  req.checkParams("canSignUp", routerUtil.errors.canNotSignUpMessage).canSignUp();
  req.checkBody("name", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("githubUsername", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("githubUsername", routerUtil.errors.usernameNotExistMessage)
    .isValidGithubUsername();
  req.checkBody("email", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("password", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("confpassword", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("profileImage", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("profileImage", routerUtil.errors.formatErrorMessage).isValidFile();
  req.checkBody("year", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleId", routerUtil.errors.formatErrorMessage).isValidNumber();
  req.checkBody("newMember", routerUtil.errors.formatErrorMessage).isValidBool();
  req.body.newMember = util.parseBool(req.body.newMember);
  return routerUtil.completeRequest(req, res, function(params) {
    return usersLogic.create(params).then(function(user) {
      res.cookie('userId', user._key, {
        maxAge: 900000,
        httpOnly: false
      });
    });
  }, "/home");
}

function _doUpdate(req, res) {
  req.body.profileImage = req.file;
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("userId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(ref);
  if (req.body.profileImage) {
    req.checkBody("profileImage", routerUtil.errors.formatErrorMessage).isValidFile();
  }
  req.checkBody("name", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("githubUsername", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("githubUsername", routerUtil.errors.usernameNotExistMessage)
    .isValidGithubUsername();
  req.checkBody("email", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("year", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleId", routerUtil.errors.formatErrorMessage).isValidNumber();
  req.checkBody("newMember", routerUtil.errors.formatErrorMessage).isValidBool();
  req.body.newMember = util.parseBool(req.body.newMember);
  return routerUtil.completeRequest(req, res, usersLogic.update,
    "/profile");
}

// METHODS
// NOTE: should be patch for _doUpdate but HTML form tag only allows GET and POST
router.post("/users", upload.single('profileImage'), function(req, res) {
  if (req.body.update) {
    _doUpdate(req, res);
  } else {
    _doCreate(req, res);
  }
});

// EXPORTS
module.exports = router;
