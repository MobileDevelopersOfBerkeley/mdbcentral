// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const bigLittleLogic = require("../../logic/BigLittleContest.js");

// METHODS
router.get("/bigLittle", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  var data;
  helper.genData("bigLittle", member).then(function(d) {
    data = d;
    return bigLittleLogic.get({
      sorted: true
    });
  }).then(function(sortedPairs) {
    data.sortedPairs = sortedPairs;
    return bigLittleLogic.get();
  }).then(function(pairs) {
    data.pairs = pairs;
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
