// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const config = require("../../config.json");

// HELPERS
function _getDocById(id) {
  return config.docs[id - 1];
}

// METHODS
router.get("/policies", function(req, res) {
  res.redirect("/policies/1");
});

router.get("/policies/:id", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  helper.genData("policies", member).then(function(data) {
    data.docPath = _getDocById(req.params.id);
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
