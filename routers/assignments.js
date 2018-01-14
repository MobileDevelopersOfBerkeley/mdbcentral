// DEPENDENCIES
const router = require("express").Router();

// METHODS
router.post("/assignments", function(req, res) {
  res.redirect("/leadership");
});

// EXPORTS
module.exports = router;
