// DEPENDENCIES
const firebase = require("firebase-admin");

// SETUP
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREABSE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREABSE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DB_URL,
  storageBucket: process.env.FIREBASE_STORAGE_URL
});

// EXPORTS
module.exports = firebase;
