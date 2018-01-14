// DEPENDENCIES
const firebase = require("firebase-admin");
const serviceAccount = require("../../conf/firebase-admin-key.json");
const config = require("../../conf/config.json");

// SETUP
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: config.firebaseDBUrl,
  storageBucket: config.firebaseStorageUrl
});

// EXPORTS
module.exports = firebase;
