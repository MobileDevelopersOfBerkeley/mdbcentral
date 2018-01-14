// DEPENDENCIES
const router = require("express").Router();

// METHODS
router.patch("/scores", function(req, res) {
  res.redirect("/leadership");
});

// EXPORTS
module.exports = router;
