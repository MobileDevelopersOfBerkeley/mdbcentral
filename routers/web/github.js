// DEPENDENCIES
const router = require("express").Router();
const helper = require("../helper.js");
const getCache = require("../../logic/GithubCache.js").get;
const getMembers = require("../../logic/Members.js").getAll;

// CONSTANTS
const hits = 5;

// HELPERS
function _getUsernameToName(members) {
  var usernameToName = {};
  members.forEach(function(member) {
    usernameToName[member.githubUsername] = member.name;
  });
  return usernameToName;
}

function _lowerCaseCache(cache) {
  function helper(d) {
    return function(username) {
      var value = (d[username] || 0) + 0;
      delete d[username];
      username = username.toLowerCase();
      d[username] = value;
    }
  }
  Object.keys(cache.userStats).forEach(helper(cache.userStats));
  Object.keys(cache.effortRatings).forEach(helper(cache.effortRatings));
  Object.keys(cache.repoStats).forEach(function(repo) {
    Object.keys(cache.repoStats[repo]).forEach(helper(cache.repoStats[repo]))
  });
  return cache;
}

function _lowerCaseMemberUsernames(members) {
  return members.map(function(member) {
    member.githubUsername = member.githubUsername.toLowerCase();
    return member;
  });
}

function _getMostRepoContribs(usernameToName, repoStats) {
  var usernameToNumRepos = {};
  Object.keys(repoStats).forEach(function(repo) {
    Object.keys(repoStats[repo]).forEach(function(username) {
      if (Object.keys(usernameToNumRepos).indexOf(username) < 0)
        usernameToNumRepos[username] = 0;
      usernameToNumRepos[username] += 1;
    });
  });
  return Object.keys(usernameToNumRepos).filter(function(username) {
    return Object.keys(usernameToName).indexOf(username) >= 0;
  }).sort(function(a, b) {
    return usernameToNumRepos[b] - usernameToNumRepos[a]
  }).slice(0, hits).map(function(username) {
    return {
      name: usernameToName[username],
      value: usernameToNumRepos[username]
    }
  });
}

function _getContribs(members, userStats, effortRatings) {
  return members.map(function(member) {
    member.value = userStats[member.githubUsername] || 0;
    member.rating = effortRatings[member.githubUsername] || 0;
    return member;
  }).sort(function(a, b) {
    return b.value - a.value;
  });
}

// METHODS
router.get("/github", helper.isLoggedIn, function(req, res) {
  var member = req.cookies.member;
  var data, members;
  helper.genData("github", member).then(function(d) {
    data = d;
    return getMembers();
  }).then(function(mList) {
    members = _lowerCaseMemberUsernames(mList);
    return getCache();
  }).then(function(cache) {
    cache = _lowerCaseCache(cache);
    console.log(cache);
    var usernameToName = _getUsernameToName(members);
    console.log(Object.keys(usernameToName));
    data.mostRepoContribs = _getMostRepoContribs(usernameToName, cache.repoStats);
    data.contributions = _getContribs(members, cache.userStats, cache.effortRatings);
    data.myContributions = data.contributions.filter(function(contrib) {
      return contrib.name == data.user.name;
    })[0].value;
    data.mostContribs = data.contributions.slice(0, hits);
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
