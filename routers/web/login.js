// DEPENDENCIES
const router = require("express").Router();
const webUtil = require("../../util/web.js");

// METHODS
router.get("/login", function(req, res) {
  webUtil.genData("login").then(function(data) {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
