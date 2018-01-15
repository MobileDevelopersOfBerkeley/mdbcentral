// DEPENDENCIES
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
const config = require("../config.json");

// CONSTANTS
const newLineStr = "\r\n";
const leadershipGmailPassword = proccess.env.GMAIL_PASSWORD;
const leadershipGmail = process.env.GMAIL_EMAIL;
const nodemailerService = "gmail";
const emailFromStr = config.gmailFromStr;
const subjectPrefix = config.gmailSubjectPrefix;

// SETUP
var transport = nodemailer.createTransport(smtpTransport({
  service: nodemailerService,
  auth: {
    user: leadershipGmail,
    pass: leadershipGmailPassword
  },
  tls: {
    rejectUnauthorized: false
  }
}));

// METHODS
function sendEmail(emailStr, subject, body) {
  var mailOptions = {
    from: emailFromStr,
    to: emailStr,
    subject: subjectPrefix + subject,
    text: body,
    html: ""
  };
  return new Promise(function(resolve, reject) {
    transport.sendMail(mailOptions, function(error, info) {
      if (error) reject(error);
      else resolve(info);
    });
  });
}

// EXPORTS
module.exports.sendEmail = sendEmail;
