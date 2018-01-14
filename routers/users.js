// DEPENDENCIES
const router = require("express").Router();

// METHODS
router.post("/users", function(req, res) {
  res.redirect("/home");
});

router.patch("/users", function(req, res) {
  res.redirect("/profile");
});

// EXPORTS
module.exports = router;
