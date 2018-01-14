function _setCookie(name, val) {
  document.cookie = name + "=" + val + "; path=/";
}

function signin() {
  var code = $("#code").val().trim();
  window.location.href = "http://legacy-dashboard.welcomeme.io/signin/" + code;
}

function logout() {
  firebase.auth().signOut().then(function() {
    _setCookie("member", "");
    window.location.href = "/";
  });
}

function login() {
  var email = $("#email").val().trim();
  var password = $("#password").val();
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user) {
      _setCookie("member", user.uid);
      window.location.href = "/";
    });
}

var cardCache = {};

function _hideCard(elementId) {
  $("#" + elementId + "Toggle").html("Show");
  cardCache[elementId] = $("#" + elementId).html();
  $("#" + elementId).html("");
}

function _showCard(elementId) {
  $("#" + elementId + "Toggle").html("Hide");
  $("#" + elementId).html(cardCache[elementId]);
}

function toggleCard(elementId) {
  var value = $("#" + elementId + "Toggle").html();
  if (value == "Hide") _hideCard(elementId);
  else _showCard(elementId);
}
