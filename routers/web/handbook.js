// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const config = require("../../config.json");
const fs = require('fs');

// CONSTANTS
const handbookDocs = fs.readdirSync("./public/docs/handbook").map(function(doc) {
  return "/handbook/" + doc;
});

// HELPERS
function _getHandbookDocById(id) {
  return handbookDocs[id - 1];
}

// METHODS
router.get("/handbook", function(req, res) {
  res.redirect("/handbook/1");
});

router.get("/handbook/:id", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  helper.genData("handbook", member).then(function(data) {
    data.docPath = _getHandbookDocById(req.params.id);
    data.docs = handbookDocs;
    data.getDocName = function(doc) {
      return doc.split("/handbook/")[1].split(".pdf")[0];
    }
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;