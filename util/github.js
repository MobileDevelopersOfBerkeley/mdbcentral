// DEPENDENCIES
const GitHubApi = require("github");
const stats = require("stats-lite");
const bluebird = require('bluebird');
const config = require("../conf/config.json");

// CONSTANTS
const client_secret = config.githubClientSecret;
const client_id = config.githubClientID;
const org_id = config.githubOrgID;
const effortRating_3_lines = config.effortRating3Lines;
const timeout = 100000;
const cli_border = "================";

// SETUP
var github = new GitHubApi({
  debug: false,
  protocol: "https",
  host: "api.github.com",
  pathPrefix: "",
  headers: {
    "user-agent": config.userAgent
  },
  Promise: bluebird,
  followRedirects: false,
  timeout: timeout
});
github.authenticate({
  type: "oauth",
  key: client_id,
  secret: client_secret
});

// HELPER
function _getBranchNames(repo_name) {
  console.log(cli_border);
  console.log(">> fetching branch names of: " + repo_name);
  var result = [];
  return github.repos.getBranches({
    owner: org_id,
    repo: repo_name
  }).then(function(branches) {
    branches = branches.data || [];
    branches.forEach(function(branch) {
      console.log("Branch hit: " + repo_name + " :: " + branch.name);
      result.push(branch.name);
    });
    return result;
  }).catch(function(error) {
    console.error(error.toString());
    return result;
  });
}

function _getCommitSHAsToBranchOfRepo(repo_name, branch_name) {
  console.log(cli_border);
  console.log(">> fetching SHAs of: " + repo_name + " :: " + branch_name);
  var result = [];
  return github.repos.getCommits({
    owner: org_id,
    repo: repo_name,
    sha: branch_name
  }).then(function(commits) {
    commits = commits.data || [];
    commits.forEach(function(commit) {
      console.log("Commit SHA hit: " + repo_name + " :: " + branch_name +
        " :: " + commit.sha);
      result.push(commit.sha);
    });
    return result;
  }).catch(function(error) {
    console.error(error.toString());
    return result;
  });
}

function _getCommitsToBranchOfRepo(repo_name, branch_name) {
  var result = [];
  return _getCommitSHAsToBranchOfRepo(repo_name, branch_name).then(function(
    shas) {
    var plist = [];
    shas.forEach(function(sha) {
      console.log(cli_border);
      console.log(">> fetching commit of: " + repo_name + " :: " +
        branch_name + " :: " + sha);
      plist.push(github.repos.getCommit({
        owner: org_id,
        repo: repo_name,
        sha: sha
      }).then(function(commit) {
        console.log("Commit hit: " + repo_name + " :: " +
          branch_name + " :: " + sha);
        result.push(commit);
      }));
    });
    return Promise.all(plist);
  }).then(function() {
    return result;
  }).catch(function(error) {
    console.error(error.toString());
    return result;
  });
}

function _getLinesCommittedToRepo(repo_name) {
  var result = {};
  return _getBranchNames(repo_name).then(function(branchNames) {
    var plist = [];
    branchNames.forEach(function(branch_name) {
      console.log(">> processing branch: " + repo_name + " :: " +
        branch_name);
      plist.push(_getCommitsToBranchOfRepo(repo_name, branch_name).then(
        function(commits) {
          commits.forEach(function(commit) {
            commit = commit.data || {};
            var username = "NULL";
            if (commit.author != null)
              username = commit.author.login.toLowerCase();
            var numLines = commit.stats.total;
            console.log(">> processing commit:" + repo_name +
              " :: " + branch_name + " :: " + commit.sha +
              " :: " + username + ": " + numLines);
            if (username in result) result[username] +=
              numLines;
            else result[username] = numLines;
          });
        }));
    });
    return Promise.all(plist);
  }).then(function() {
    return result;
  }).catch(function(error) {
    console.error(error.toString());
    return result;
  });
}

function _getLinesCommittedToEachRepo() {
  var result = {};
  console.log(cli_border);
  console.log(">> fetching repos of: " + org_id);
  return github.repos.getForOrg({
    org: org_id
  }).then(function(repos) {
    repos = repos.data || [];
    var plist = [];
    repos.forEach(function(repo) {
      console.log("Repo hit: " + repo.name);
      plist.push(_getLinesCommittedToRepo(repo.name).then(function(
        usernameToLines) {
        result[repo.name] = usernameToLines;
      }));
    });
    return Promise.all(plist);
  }).then(function() {
    return result;
  }).catch(function(error) {
    console.error(error.toString());
    return result;
  });
}

// METHODS
function getCache() {
  return _getLinesCommittedToEachRepo().then(function(cache) {
    console.log(cli_border);
    console.log("CACHE: ");
    console.log(JSON.stringify(cache, null, 2));
    return cache;
  });
}

function listEffortRatings(cache) {
  var repoToUsernameToLines = cache;
  var result = {};
  for (var repo_name in repoToUsernameToLines) {
    var usernameToLines = repoToUsernameToLines[repo_name];
    var values = Object.keys(usernameToLines).map(function(username) {
      return usernameToLines[username];
    });
    var effortRating_1 = stats.percentile(values, 0.1);
    var effortRating_2 = stats.percentile(values, 0.3);
    var effortRating_3 = stats.percentile(values, 0.5);
    var effortRating_4 = stats.percentile(values, 0.7);
    for (var username in usernameToLines) {
      var lines = usernameToLines[username];
      var effortRating = undefined;
      if (lines <= effortRating_1) effortRating = 1;
      else if (lines <= effortRating_2) effortRating = 2;
      else if (lines <= effortRating_3) effortRating = 3;
      else if (lines <= effortRating_4) effortRating = 4;
      else effortRating = 5;
      if (lines >= effortRating_3_lines && effortRating < 3) effortRating = 3;
      if (username in result) {
        result[username] = Math.max(result[username], effortRating);
      } else {
        result[username] = effortRating;
      }
    }
  }
  return result
}

// EXPORTS
module.exports.getCache = getCache;
module.exports.listEffortRatings = listEffortRatings;
