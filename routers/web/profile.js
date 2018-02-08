// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");

// METHODS
router.get("/profile", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  helper.genData("profile", member).then(function(data) {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
