// DEPENDENCIES
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("./routers/main.js");
const validator = require('./routers/validator.js');
const slack = require("./util/slack.js");

// SETUP
var app = express();
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
// slack.listen();
const port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Server listening on port: " + port);
});
