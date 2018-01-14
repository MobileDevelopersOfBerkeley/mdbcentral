// DEPENDENCIES
const storageUtil = require("../util/firebase/storage.js");
const dbUtil = require("../util/firebase/db.js");
const authUtil = require("../util/firebase/auth.js");
const githubUtil = require("../util/github.js");
const getGithubCache = require("./GithubCache.js").get;
const getRoleByUid = require("./Roles.js").getByUid;

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

function create(params) {
  var url, authData;
  if (params.password != params.confpassword) {
    return Promise.reject(new Error("passwords dont match"));
  }
  return authUtil.createAuthAccount(params.email, params.password)
    .then(function(data) {
      authData = data;
      return storageUtil.upload(params.profileImage);
    }).then(function(link) {
      url = link;
      return authUtil.updateAuthAccount(authData.uid, {
        displayName: params.name,
        photoURL: url
      });
    }).then(function() {
      return dbUtil.createNewObject(ref, {
        name: params.name,
        email: params.email,
        profileImage: url,
        major: params.major,
        year: params.year,
        roleId: params.roleId,
        newMember: params.isNew,
        githubUsername: githubUsername.toLowerCase()
      }, authData.uid);
    }).catch(function(error) {
      if (!authData) return Promise.reject(error);
      return authUtil.deleteAuthAccount(authData.uid);
    });
}

function updateEffortRatings() {
  return getGithubCache().then(function(cache) {
    var usernameToEffortRating = githubUtil.listEffortRatings(cache);
    return Promise.all(Object.keys(usernameToEffortRating)
      .map(function(username) {
        var effortRating = usernameToEffortRating[username];
        return dbUtil.getObjectsByFields(ref, {
          githubUsername: username
        }).then(function(user) {
          return dbUtil.updateObject(ref, user._key, {
            effortRating: effortRating
          });
        });
      }));
  });
}

function update(params) {
  var plist = [];

  if (params.password != null && params.password != params.confpassword) {
    return Promise.reject(new Error("passwords dont match"));
  }

  if (params.profileImage != null) {
    var url;
    plist.push(storageUtil.upload(params.profileImage).then(function(link) {
      url = link;
      return authUtil.updateAuthAccount(params.id, {
        photoURL: url,
        email: params.email,
        displayName: params.name
      });
    }).then(function() {
      return dbUtil.updateObject(ref, params.id, {
        profileImage: url
      });
    }));
  }

  if (params.password != null) {
    plist.push(authUtil.updateAuthAccount(params.id, {
      password: params.password
    }));
  }

  plist.push(dbUtil.updateObject(ref, params.id), {
    name: params.name,
    email: params.email,
    major: params.major,
    isNew: params.isNew,
    roleId: params.roleId,
    year: params.year,
    githubUsername: params.githubUsername
  });

  return Promise.all(plist);
}

function getRole(params) {
  return getById({
    id: params.id
  }).then(function(user) {
    return getRoleByUid({
      roleId: user.roleId
    });
  });
}

function getMaxAbsences(params) {
  return getById({
    id: params.id
  }).then(function(user) {
    return dbUtil.refs.roleRef.child(user.roleId).child("maxAbsences")
      .once("value").then(function(snapshot) {
        if (!snapshot.exists()) return 0;
        return snapshot.val();
      });
  });
}

// EXPORTS
module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.getRole = getRole;
module.exports.update = update;
module.exports.updateEffortRatings = updateEffortRatings;
module.exports.getMaxAbsences = getMaxAbsences;
