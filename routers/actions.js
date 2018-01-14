// DEPENDENCIES
const router = require("express").Router();

// METHODS
router.delete("/expectedAbsences", function(req, res) {
  // return Attendance.deleteExpectedAbsence(expectedAbsence).then(function() {
  //   changeSpinnerAsync(false);
  //   showSuccessModal("expected absence deleted! Please refresh page.");
  //   window.location.href = "/";
  // }).catch(function(error) {
  //   changeSpinnerAsync(false);
  //   showErrorModal(error.toString());
  // });
  res.redirect("/home");
});

router.post("/expectedAbsences", function(req, res) {
  /*
  Attendance.submitExpectedAbsence($scope.uid, $scope.expected_absence_event_id, $scope.expected_absence_event_reason).then(function() {
    changeSpinnerAsync(false);
    showSuccessModal("expected absence submitted");
  }).catch(function(error) {
    changeSpinnerAsync(false);
    showErrorModal(error.toString());
  });
  */
  res.redirect("/calendar");
});

router.post("/feedback", function(req, res) {
  /*
  Attendance.submitFeedback($scope.uid, $scope.feedback_event_id, $scope.feedback_response).then(function() {
    changeSpinnerAsync(false);
    showSuccessModal("feedback submitted");
  }).catch(function(error) {
    changeSpinnerAsync(false);
    showErrorModal(error.toString());
  });
  */
  res.redirect("/calendar");
});

router.post("/login", function(req, res) {
  res.redirect("/home");
});

router.patch("/resetPassword", function(req, res) {
  res.send("Password was reset successfully!");
});

router.post("/users", function(req, res) {
  res.redirect("/home");
});

router.patch("/users", function(req, res) {
  res.redirect("/profile");
});

// EXPORTS
module.exports = router;
