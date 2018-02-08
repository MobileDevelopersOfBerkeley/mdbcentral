// DEPENDENCIES
const firebase = require("firebase-admin");
const firebaseUtil = require("firebase-admin-util");
const schema = require("../schema.json");

// INITIALIZE
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DB_URL,
  storageBucket: process.env.FIREBASE_STORAGE_URL
});

// EXPORTS
module.exports = firebaseUtil(firebase, schema);
