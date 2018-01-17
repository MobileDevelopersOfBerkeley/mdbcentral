// DEPENDENCIES
const storageUtil = require("../util/firebase/storage.js");
const dbUtil = require("../util/firebase/db.js");
const authUtil = require("../util/firebase/auth.js");
const githubUtil = require("../util/github.js");
const stripeUtil = require("../util/stripe.js");
const getGithubCache = require("./GithubCache.js").get;
const getRoleByUid = require("./Roles.js").getByUid;

// CONSTANTS
const ref = dbUtil.refs.memberRef;

// HELPERS
function _setupAccount(stripeToken) {
  var accountId;
  return stripeUtil.createAccount().then(function(accId) {
    accountId = accId;
    return stripeUtil.updateAccountCard(accountId, stripeToken);
  }).then(function() {
    return accountId;
  });
}

// METHODS
function isLeadership(params) {
  return getById({
    id: params.id
  }).then(function(user) {
    return user.leadership === true;
  });
}

function addLeader(params) {
  return dbUtil.updateObject(ref, params.id, {
    leadership: true
  });
}

function removeLeader(params) {
  return getAll().then(function(members) {
    var leaders = members.filter(function(member) {
      return member.leadership === true;
    });
    if (leaders == 1 && leaders[0]._key != params.id)
      return Promise.reject(new Error("SYS FAIL"));
    else if (leaders == 1)
      return Promise.reject(new Error(
        "Can't remove yourself as leader! You are only leader left."));
    return dbUtil.updateObject(ref, params.id, {
      leadership: false
    });
  });
}

function getById(params) {
  var id = params.id;
  return dbUtil.getByKey(ref, id);
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
      return _setupAccount(params.stripeToken);
    }).then(function(accountId) {
      return dbUtil.createNewObject(ref, {
        accountId: accountId,
        name: params.name,
        email: params.email,
        profileImage: url,
        major: params.major,
        year: params.year,
        roleId: params.roleId,
        newMember: params.newMember,
        githubUsername: params.githubUsername.toLowerCase()
      }, authData.uid);
    }).catch(function(error) {
      if (!authData) return Promise.reject(error);
      return authUtil.deleteAuthAccount(authData.uid).then(function() {
        return Promise.reject(error);
      });
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
      return authUtil.updateAuthAccount(params.member, {
        photoURL: url,
        email: params.email,
        displayName: params.name
      });
    }).then(function() {
      return dbUtil.updateObject(ref, params.member, {
        profileImage: url
      });
    }));
  }

  if (params.password && params.password.trim() != "") {
    plist.push(authUtil.updateAuthAccount(params.member, {
      password: params.password
    }));
  }

  plist.push(dbUtil.getByKey(ref, params.member).then(function(member) {
    if (member.accountId)
      return stripeUtil.updateAccountCard(member.accountId, params.stripeToken);
    return _setupAccount(params.stripeToken)
      .then(function(accountId) {
        return dbUtil.updateObject(ref, params.member, {
          accountId: accountId
        });
      });
  }));

  plist.push(dbUtil.updateObject(ref, params.member, {
    name: params.name,
    email: params.email,
    major: params.major,
    newMember: params.newMember,
    roleId: params.roleId,
    year: params.year,
    githubUsername: params.githubUsername.toLowerCase()
  }));

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

function charge(params) {
  return dbUtil.getByKey(ref, params.member).then(function(member) {
    if (!member.accountId) {
      return Promise.reject(new Error(
        "Can't charge user! They have not entered their payment information on mdbcentral yet!"
      ));
    }
    return stripeUtil.charge(member.accountId, params.dollars, params.desc);
  });
}

function transfer(params) {
  return dbUtil.getByKey(ref, params.member).then(function(member) {
    if (!member.accountId) {
      return Promise.reject(new Error(
        "Can't transfer money to user! They have not entered their payment information on mdbcentral yet!"
      ));
    }
    return stripeUtil.transfer(member.accountId, params.dollars, params.type);
  });

}

function getCardInfo(params) {
  return dbUtil.getByKey(ref, params.member).then(function(member) {
    if (!member.accountId) return null;
    return stripeUtil.getCard(member.accountId);
  });
}

// EXPORTS
module.exports.removeLeader = removeLeader;
module.exports.addLeader = addLeader;
module.exports.getCardInfo = getCardInfo;
module.exports.charge = charge;
module.exports.transfer = transfer;
module.exports.isLeadership = isLeadership;
module.exports.getById = getById;
module.exports.getAll = getAll;
module.exports.getRole = getRole;
module.exports.update = update;
module.exports.create = create;
module.exports.updateEffortRatings = updateEffortRatings;
module.exports.getMaxAbsences = getMaxAbsences;
