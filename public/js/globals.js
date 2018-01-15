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

var elements = stripe.elements();
var card = elements.create('card', {
  style: {
    base: {
      color: '#32325d',
      lineHeight: '18px',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
});

function setupStripeInput(formId, inputId, errorId, tokenCallback) {
  card.mount('#' + inputId);
  card.addEventListener('change', function(event) {
    var displayError = document.getElementById(errorId);
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });
  var form = document.getElementById(formId);
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        var errorElement = document.getElementById(errorId);
        errorElement.textContent = result.error.message;
      } else {
        tokenCallback(result.token);
      }
    });
  });
}

function _postUsers(data, cb) {
  $.ajax({
    url: "/users",
    type: "post",
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function(response) {
      cb(response);
    },
    error: function(error) {
      if (!error.responseJSON) alert(error);
      else if (error.responseJSON.message) alert(error.responseJSON.message);
      else alert(error.responseJSON.error);
    }
  });
}

function signup(token) {
  // TODO: figure out how to form data
  var data = {
    stripeToken: token
  };
  _postUsers(data, function(user) {
    _setCookie("member", user._key);
    window.location.href = "/home";
  });
}

function updateProfile(token) {
  // TODO: figure out how to form data
  var data = {
    stripeToken: token,
    update: true
  };
  _postUsers(data, function() {
    window.location.href = "/profile";
  });
}
