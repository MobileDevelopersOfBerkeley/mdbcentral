// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");

// METHODS
router.get("/leadership", helper.isLoggedIn, helper.isLeadership,
  function(req, res) {
    var member = req.cookies.member;
    var data;
    helper.genData("leadership", member).then(function(d) {
      data = d;
      return helper.getMembers(data);
    }).then(function() {
      data.leaders = data.members.filter(function(member) {
        return member.leadership === true;
      });
      res.render("index", data);
    });
  });

// EXPORTS
module.exports = router;
