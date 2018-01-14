function signin() {
  var code = $("#code").val().trim();
  window.location.href = "http://legacy-dashboard.welcomeme.io/signin/" + code;
}
