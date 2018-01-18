// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");

// METHODS
router.get("/login", function(req, res) {
  helper.genData("login").then(function(data) {
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
