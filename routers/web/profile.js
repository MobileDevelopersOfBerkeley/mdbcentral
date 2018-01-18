// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const memberLogic = require("../../logic/Members.js");

// METHODS
router.get("/profile", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  var data;
  helper.genData("profile", member).then(function(d) {
    data = d;
    return memberLogic.getCardInfo({
      member: member
    });
  }).then(function(card) {
    data.cardInfo = card;
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
