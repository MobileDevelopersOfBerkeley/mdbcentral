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

// EXPORTS
module.exports = router;
