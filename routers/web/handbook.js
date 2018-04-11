// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const config = require("../../config.json");
const fs = require('fs');

// CONSTANTS
const docs = fs.readdirSync("./public/docs").map(function(doc) {
  return "/docs/" + doc;
});

// HELPERS
function _getDocById(id) {
  return docs[id - 1];
}

// METHODS
router.get("/policies", function(req, res) {
  res.redirect("/policies/1");
});

router.get("/policies/:id", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  helper.genData("policies", member).then(function(data) {
    data.docPath = _getDocById(req.params.id);
    data.docs = docs;
    data.getDocName = function(doc) {
      return doc.split("/docs/")[1].split(".pdf")[0];
    }
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;