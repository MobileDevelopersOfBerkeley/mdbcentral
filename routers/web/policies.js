// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const config = require("../../config.json");
const fs = require('fs');

// CONSTANTS
const policyDocs = fs.readdirSync("./public/docs/policies").map(function(doc) {
  return "/docs/policies/" + doc;
});

// HELPERS
function _getPolicyDocById(id) {
  return policyDocs[id - 1];
}

// METHODS
router.get("/policies", function(req, res) {
  res.redirect("/policies/1");
});

router.get("/policies/:id", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  helper.genData("policies", member).then(function(data) {
    data.docPath = _getPolicyDocById(req.params.id);
    data.docs = policyDocs;
    data.getDocName = function(doc) {
      return doc.split("/policies/")[1].split(".pdf")[0];
    }
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
