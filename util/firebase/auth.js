// DEPENDENCIES
const firebase = require("./fb.js");
const auth = firebase.auth();

// METHODS
function assertEmailNotTaken(email) {
  return auth.getUserByEmail(email).catch(function(error) {})
    .then(function(userRecord) {
      if (userRecord && userRecord.uid)
        return Promise.reject(new Error("Email is taken"));
    });
}

function deleteAuthAccount(uid) {
  return auth.deleteUser(uid);
}

function createAuthAccount(email, password) {
  return auth.createUser({
    email: email,
    emailVerified: false,
    password: password,
    disabled: false
  });
}

function updateAuthAccount(uid, info) {
  return auth.updateUser(uid, info);
}

// EXPORTS
module.exports.assertEmailNotTaken = assertEmailNotTaken;
module.exports.updateAuthAccount = updateAuthAccount;
module.exports.deleteAuthAccount = deleteAuthAccount;
module.exports.createAuthAccount = createAuthAccount;
