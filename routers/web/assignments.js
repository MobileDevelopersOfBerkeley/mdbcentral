// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const scoresLogic = require("../../logic/Scores.js");

// METHODS
router.get("/assignments", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  helper.genData("assignments", member).then(function(data) {
    return scoresLogic.getByMemberDeep({
      member: member
    }).then(function(scores) {
      data.scores = scores;
      res.render("index", data);
    });
  });
});

// EXPORTS
module.exports = router;
