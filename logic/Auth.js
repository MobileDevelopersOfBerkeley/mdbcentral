function resetPassword(email) {
  if (email == null || email.trim() == "") {
    return firebase.Promise.reject("Please fill in email");
  }
  return firebase.auth().sendPasswordResetEmail(email);
}

function login(email, password) {
  if (email == null || email.trim() == "") {
    return firebase.Promise.reject("Please fill in email");
  }
  if (password == null || password.trim() == "") {
    return firebase.Promise.reject("Please fill in password");
  }
  return firebase.auth().signInWithEmailAndPassword(email, password);
}

function signup(name, email, password, confpassword, profileImage,
  major, year, roleId, newMember, githubUsername) {
  if (name == null || name.trim() == "") {
    return firebase.Promise.reject("Please fill in name");
  }
  if (githubUsername == null || githubUsername.trim() == "") {
    return firebase.Promise.reject("Please fill in githubUsername");
  }
  if (email == null || email.trim() == "") {
    return firebase.Promise.reject("Please fill in email");
  }
  if (password == null || password == "") {
    return firebase.Promise.reject("Please fill in password");
  }
  if (confpassword == null || confpassword == "") {
    return firebase.Promise.reject("Please fill in confirm password");
  }
  if (profileImage == null) {
    return firebase.Promise.reject("Please fill in profile image");
  }
  if (year == null || year.trim() == "") {
    return firebase.Promise.reject("Please fill in year");
  }
  if (roleId == null) {
    return firebase.Promise.reject("Please fill in role");
  }
  if (password != confpassword) {
    return firebase.Promise.reject("Passwords do not match");
  }
  newMember = newMember || false;
  var url = null;
  var authData = null;
  return can_sign_up_ref.once("value").then(function(snapshot) {
    if (!snapshot.exists() || snapshot.val() !== true) return firebase.Promise
      .reject("No more members are aloud to signup");
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }).then(function(authDataa) {
    authData = authDataa;
    return upload(profileImage)
  }).then(function(urll) {
    url = urll;
    return authData.updateProfile({
      displayName: name,
      photoURL: url
    });
  }).then(function() {
    return firebase.database().ref().child("Members/" + authData.uid).set({
      name: name,
      email: email,
      profileImage: url,
      major: major,
      year: year,
      roleId: roleId,
      newMember: newMember,
      githubUsername: githubUsername.toLowerCase()
    });
  }).catch(function(error) {
    if (authData) authData.delete();
    return firebase.Promise.reject(error);
  });
}

function getLogInData(user) {
  if (!isLoggedIn()) return firebase.Promise.reject("not logged in");
  var firstName = user.displayName;
  if (firstName.indexOf(" ") >= 0) firstName = firstName.split(" ")[0];
  return member_ref.child(user.uid).child("leadership").once("value").then(
    function(snapshot) {
      var leadership = false;
      if (snapshot.val) leadership = snapshot.val();
      return [firstName, leadership];
    });
}

function isLoggedIn() {
  return firebase.auth().currentUser != null;
}

function listenAuthStateChanged() {
  return new Promise(function(resolve, reject) {
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) window.location.href = "#/login";
      resolve(user);
    });
  });
}

function logout() {
  return firebase.auth().signOut();
}

return {
  listenAuthStateChanged: listenAuthStateChanged,
  isLoggedIn: isLoggedIn,
  getLogInData: getLogInData,
  resetPassword: resetPassword,
  login: login,
  signup: signup,
  isLoggedIn: isLoggedIn,
  logout: logout
}
