// DEPENDENCIES
const router = require("express").Router();

// HELPERS
function _getLiTag(currPage) {
  return function(page) {
    if (currPage != page) return "<li>";
    return "<li class='active'>";
  }
}

// METHODS
router.get("/", function(req, res) {
  res.redirect("/home");
});

router.get("/login", function(req, res) {
  res.render("index", {
    currPage: "login"
  });
});

router.get("/home", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "home",
    leadership: false,
    getLiTag: _getLiTag("home")
  });
});

router.get("/assignments", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "assignments",
    leadership: false,
    getLiTag: _getLiTag("assignments")
  });
});

router.get("/calendar", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "calendar",
    leadership: false,
    getLiTag: _getLiTag("calendar")
  });
});

router.get("/leadership", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "leadership",
    leadership: false,
    getLiTag: _getLiTag("leadership")
  });
});

router.get("/policies", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "policies",
    leadership: false,
    getLiTag: _getLiTag("policies")
  });
});

router.get("/profile", function(req, res) {
  res.render("index", {
    firstname: "Krishnan",
    notifications: [],
    currPage: "profile",
    leadership: false,
    getLiTag: _getLiTag("profile")
  });
});

// EXPORTS
module.exports = router;
