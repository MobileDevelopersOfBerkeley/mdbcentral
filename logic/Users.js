// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const githubUtil = require("../util/github.js");

// CONSTANTS
const ref = dbUtil.refs.userRef;

// METHODS
function getById(params) {
  var id = params.id;
  return dbutil.getByKey(ref, id);
}

function getAll() {
  return dbUtil.getAll(ref);
}

// function updateEffortRatings() {
//   return dbUtil.refs.githubCacheRef.once("value").then(function(snapshot) {
//     var cache = JSON.parse(snapshot.val());
//     var usernameToEffortRating = githubUtil.listEffortRatings(cache);
//     return Promise.all(Object.keys(usernameToEffortRating)
//       .map(function(username) {
//         var effortRating = usernameToEffortRating[username];
//         return dbUtil.getObjectsByFields(ref, {
//           githubUsername: username
//         }).then(function(user) {
//           return dbUtil.updateObject(ref, user._key, {
//             effortRating: effortRating
//           });
//         });
//       }));
//   });
// }
//
// function getTotalWatchList() {
//   return member_ref.once("value").then(function(snapshot) {
//     var memberMap = snapshot.val();
//     var result = 0;
//     for (var key in memberMap) {
//       var member = memberMap[key];
//       if (member.watchList) result += 1;
//     }
//     return result;
//   });
// }
//
// function getTotalBoardReviewList() {
//   return member_ref.once("value").then(function(snapshot) {
//     var memberMap = snapshot.val();
//     var result = 0;
//     for (var key in memberMap) {
//       var member = memberMap[key];
//       if (member.boardReviewList) result += 1;
//     }
//     return result;
//   });
// }
//
// function listMembers() {
//   return member_ref.once("value").then(function(snapshot) {
//     var memberMap = snapshot.val();
//     var members = [];
//     for (var key in memberMap) {
//       var member = memberMap[key];
//       member.uid = key;
//       members.push(member);
//     }
//     return members;
//   });
// }
//
// function editProfile(user, edit_name, edit_email, edit_password,
//   edit_confpassword,
//   edit_major, edit_profileImage, edit_new, edit_roleId, edit_year,
//   edit_githubUsername) {
//
//   if (edit_githubUsername == null || edit_githubUsername.trim() == "" ||
//     edit_name == null || edit_name.trim() == "" || edit_email == null ||
//     edit_email.trim() == "" || edit_major == null || edit_major.trim() == "" ||
//     edit_roleId == null || edit_year == null || edit_year.trim() == "") {
//     return firebase.Promise.reject("Please fill in required fields");
//   }
//   if (edit_password != null && edit_password != edit_confpassword) {
//     return firebase.Promise.reject("Passwords do not match");
//   }
//   edit_new = edit_new || false;
//
//   var plist = [];
//
//   if (edit_profileImage != null) {
//     var url = "";
//     plist.push(upload(edit_profileImage).then(function(urll) {
//       url = urll;
//       return user.updateProfile({
//         photoURL: url
//       })
//     }).then(function() {
//       member_ref.child(user.uid).child("profileImage").set(url);
//     }));
//   }
//
//   plist.push(user.updateProfile({
//     displayName: edit_name
//   }));
//
//   plist.push(user.updateEmail(edit_email));
//
//   if (edit_password != null) {
//     plist.push(user.updatePassword(edit_password));
//   }
//
//   plist.push(member_ref.child(user.uid).update({
//     name: edit_name,
//     email: edit_email,
//     major: edit_major,
//     newMember: edit_new,
//     roleId: edit_roleId,
//     year: edit_year,
//     githubUsername: edit_githubUsername
//   }));
//
//   return firebase.Promise.all(plist);
// }
//
// function getRole(uid) {
//   return member_ref.child(uid).child("roleId").once("value").then(function(
//     snapshot) {
//     if (!snapshot.exists()) return "NULL";
//     var index = snapshot.val();
//     return role_ref.child(index).child("title").once("value").then(function(
//       snapshot) {
//       if (!snapshot.exists()) return "NULL";
//       return snapshot.val();
//     });
//   });
// }
//
// function getRoleObjects() {
//   return role_ref.once("value").then(function(snapshot) {
//     var x = snapshot.val() || [];
//     var result = [];
//     for (var i = 0; i < x.length; i++) {
//       result.push(x[i]);
//     }
//     return result;
//   });
// }
//
// function getRoles() {
//   return role_ref.once("value").then(function(snapshot) {
//     var x = snapshot.val() || [];
//     var result = [];
//     for (var i = 0; i < x.length; i++) {
//       result.push(x[i].title);
//     }
//     return result;
//   });
// }
//
// function getMember(uid) {
//   return member_ref.child(uid).once("value").then(function(snapshot) {
//     return snapshot.val();
//   });
// }
//
// return {
//   getRoles: getRoles,
//   getRoleObjects: getRoleObjects,
//   getMember: getMember,
//   listMembers: listMembers,
//   getRole: getRole,
//   editProfile: editProfile,
//   getTotalWatchList: getTotalWatchList,
//   getTotalBoardReviewList: getTotalBoardReviewList
// }

// EXPORTS
module.exports.getById = getById;
module.exports.getAll = getAll;
