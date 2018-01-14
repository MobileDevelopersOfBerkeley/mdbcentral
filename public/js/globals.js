function _setCookie(name, val) {
  document.cookie = "mdbcentral-" + name + "=" + val + "; path=/";
}

function signin() {
  var code = $("#code").val().trim();
  window.location.href = "http://legacy-dashboard.welcomeme.io/signin/" + code;
}

function logout() {
  firebase.auth().signOut().then(function() {
    _setCookie("uid", "");
    window.location.href = "/";
  });
}

function login() {
  var email = $("#email").val().trim();
  var password = $("#passowrd").val();
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user) {
      _setCookie("uid", user.uid);
      window.location.href = "/";
    });
}

function toggleCard(elementId) {
  // TODO: ...
}
