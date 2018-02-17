// DEPENDENCIES
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("./routers/main.js");
const validator = require('./routers/validator.js');
const slack1 = require("./logic/Slack1.js");
const slack2 = require("./logic/Slack2.js");
const config = require("./config.json");

// CONSTANTS
const port = process.env.PORT || config.devPort;

// SETUP
var app = express();
app.use(function(req, res, next) {
  if (process.env.ENV == "PROD" &&
    req.headers['x-forwarded-proto'] != 'https')
    return res.redirect('https://' + req.headers.host + req.url)
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(validator);
app.use(cookieParser());
app.use("/", router);
app.set('view engine', 'ejs');
app.use(express.static("public"));

// START SERVER
slack1.listen(function() {
  console.log("Slack Bot 1 listening");
}, function() {
  console.log("Slack Bot 1 FATAL ERROR");
});
slack2.listen(function() {
  console.log("Slack Bot 2 listening");
}, function() {
  console.log("Slack Bot 2 FATAL ERROR");
});
app.listen(port, function() {
  console.log("Server listening on port: " + port);
});
