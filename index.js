// DEPENDENCIES
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("./routers/main.js");
const validator = require('./routers/validator.js');
const slack = require("./util/slack.js");
const config = require("./config.json");

// CONSTANTS
const port = process.env.PORT || config.devPort;

// SETUP
var app = express();

// NOTE: comment this out when running locally
app.use(function(req, res, next) {
  if (!req.secure)
    return res.redirect('https://' + req.headers.host + req.url);
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
slack.listen();
app.listen(port, function() {
  console.log("Server listening on port: " + port);
});
