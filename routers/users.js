// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const dbUtil = require("../util/firebase/db.js");
const usersLogic = require("../logic/Users.js");

// CONSTANTS
const ref = dbUtil.refs.userRef;

// METHODS
router.post("/users", function(req, res) {
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
  req.checkBody("isNew", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, function(params) {
    return usersLogic.create(params).then(function(user) {
      res.cookie('userId', user._key, {
        maxAge: 900000,
        httpOnly: false
      });
    });
  }, "/home");
});

router.patch("/users", function(req, res) {
  req.checkCookies("userId", routerUtil.errors.notLoggedInMessage).notEmpty();
  req.checkCookies("userId", routerUtil.errors.dbErrorMessage)
    .keyExistsInDB(ref);
  req.checkBody("name", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("githubUsername", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("githubUsername", routerUtil.errors.usernameNotExistMessage)
    .isValidGithubUsername();
  req.checkBody("email", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("year", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleId", routerUtil.errors.missingErrorMessage).notEmpty();
  req.checkBody("roleId", routerUtil.errors.formatErrorMessage).isValidNumber();
  req.checkBody("isNew", routerUtil.errors.missingErrorMessage).notEmpty();
  return routerUtil.completeRequest(req, res, userLogic.update,
    "/profile");
});

// EXPORTS
module.exports = router;
