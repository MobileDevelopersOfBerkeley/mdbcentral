function _setCookie(name, val) {
  document.cookie = name + "=" + val + "; path=/";
}

function logout() {
  firebase.auth().signOut().then(function() {
    _setCookie("member", "");
    window.location.href = "/";
  });
}

function login() {
  var email = $("#loginEmail").val().trim();
  var password = $("#loginPassword").val();
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

function _postUsers(cb, isUpdate) {
  var data = new FormData();
  if (isUpdate) data.append('update', true);

  function _getInt(val) {
    if (!val || val.trim() == "") return null;
    return parseInt(val);
  }

  function _getString(val) {
    if (!val || val.trim() == "") return null;
    return val;
  }

  function _getBool(dom) {
    return dom.checked === true;
  }

  function _getFile(dom) {
    if (!dom || !dom.files || dom.files.length == 0 || !dom.files[0])
      return null;
    return dom.files[0];
  }

  var vals = {
    'name': "string",
    'email': "string",
    'password': "string",
    'confpassword': "string",
    'profileImage': "file",
    'newMember': "boolean",
    'roleId': "number",
    'year': "string",
    'major': 'string',
    'birthday': 'string',
    'githubUsername': 'string'
  };

  Object.keys(vals).forEach(function(param) {
    var type = vals[param];
    var value = null;
    if (type == "string")
      value = _getString($("#" + param).val());
    else if (type == "number")
      value = _getInt($("#" + param).val());
    else if (type == "boolean")
      value = _getBool($("#" + param)[0]);
    else if (type == "file")
      value = _getFile($("#" + param)[0]);
    if (value !== null)
      data.append(param, value);
  });

  $.ajax({
    url: "/users",
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    method: 'POST',
    type: 'POST',
    success: function(response) {
      cb(response.result);
    },
    error: function(error) {
      alert("Oops! Something went wrong :(");
    }
  });
}

function signup() {
  _postUsers(function(user) {
    _setCookie("member", user._key);
    window.location.href = "/home";
  });
}

function updateProfile() {
  _postUsers(function() {
    window.location.href = "/profile";
  }, true);
}
