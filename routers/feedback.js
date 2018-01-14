// DEPENDENCIES
const router = require("express").Router();

// METHODS
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

// EXPORTS
module.exports = router;
