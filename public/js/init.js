// Initialize Firebase
var config = {
  apiKey: "AIzaSyCRH2FRIbkKgESpMoDYK2WlaQ_M2GMMZPo",
  authDomain: "mobiledevsberkeley-89d21.firebaseapp.com",
  databaseURL: "https://mobiledevsberkeley-89d21.firebaseio.com",
  storageBucket: "mobiledevsberkeley-89d21.appspot.com",
  messagingSenderId: "209888741444"
};
firebase.initializeApp(config);

var root_ref = firebase.database().ref();
var score_ref = root_ref.child("Scores");
var member_ref = root_ref.child("Members");
var signin_ref = root_ref.child("SignIns");
var absence_ref = root_ref.child("Absences");
var expected_absence_ref = root_ref.child("ExpectedAbsences");
var feedback_ref = root_ref.child("Feedback");
var assignment_ref = root_ref.child("Assignments");
var role_ref = root_ref.child("Roles");
var report_ref = root_ref.child("Reports");
var semester_start_ref = root_ref.child("semesterStart");
var last_update_timestamp_ref = root_ref.child("lastUpdateTimestamp");
var sign_in_code_ref = root_ref.child("signInCode");
var sign_in_minutes_ref = root_ref.child("signInMinutes");
var can_sign_up_ref = root_ref.child("canSignUp");
var github_cache_ref = root_ref.child("GithubCache");
