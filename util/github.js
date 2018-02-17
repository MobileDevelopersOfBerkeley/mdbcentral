// DEPENDENCIES
const GitHubApi = require("github");
const config = require("../config.json");

// CONSTANTS
const token = process.env.GITHUB_TOKEN;
const timeout = 100000;
const sourceCodeExts = [
  "js", "ejs", "html", "py", "css", "swift",
  "c", "cpp", "h", "java"
];
const ignoreFolders = [
  "node_modules", "bower_components"
];
const ignoreExts = [
  "md"
];
const maxLinesConsideredPerFile = 1000;
const maxLinesConsideredPerCommit = 2000;

// SETUP
var github = new GitHubApi({
  debug: false,
  protocol: "https",
  host: "api.github.com",
  pathPrefix: "",
  headers: {
    "user-agent": config.userAgent
  },
  timeout: timeout
});
github.authenticate({
  type: 'token',
  token: token
});

// HELPERS
function _isValidFileName(filename) {
  if (filename.indexOf(".") < 0) return false;
  var x = filename.split(".");
  var ext = x[x.length - 1].trim().toLowerCase();
  if (filename.indexOf("/") >= 0) {
    var folder = filename.split("/")[0];
    if (ignoreFolders.indexOf(folder) >= 0) return false;
  }
  return ignoreExts.indexOf(ext) < 0 && sourceCodeExts.indexOf(ext) >= 0;
}

function _getFileTotal(file) {
  return file.additions + file.changes;
}

function _isValidFile(file) {
  var validLines = _getFileTotal(file) <= maxLinesConsideredPerFile;
  return validLines && _isValidFileName(file.filename);
}

function _getCommits(org, repoName) {
  var commits = [];
  return github.repos.getCommits({
    owner: org,
    repo: repoName
  }).then(function(res) {
    return Promise.all(res.data.map(function(commit) {
      return github.repos.getCommit({
        owner: org,
        repo: repoName,
        sha: commit.sha
      }).then(function(res) {
        commits.push(res.data);
      });
    }));
  }).then(function() {
    return commits;
  });
}

function _getReposForOrg(org) {
  var repos;
  return github.repos.getForOrg({
    org: org,
    type: "public"
  }).then(function(res) {
    repos = res.data;
    return github.repos.getForOrg({
      org: org,
      type: "private"
    });
  }).then(function(res) {
    return repos.concat(res.data);
  });
}

function _getRepoStats(org, repoName) {
  return _getCommits(org, repoName).then(function(commits) {
    var stats = {};
    commits.forEach(function(commit) {
      if (!commit.author) return false;
      var username = commit.author.login.toLowerCase();
      var total = commit.files.filter(_isValidFile)
        .reduce(function(sum, file) {
          sum += _getFileTotal(file);
          return sum;
        }, 0);
      if (total > maxLinesConsideredPerCommit) return false;
      if (Object.keys(stats).indexOf(username) < 0)
        stats[username] = 0;
      stats[username] += total;
    });
    return stats;
  });
}

// METHODS
function getStats(org) {
  var stats = {
    userStats: {},
    repoStats: {}
  };
  return _getReposForOrg(org).then(function(repos) {
    return Promise.all(repos.map(function(repo) {
      return _getRepoStats(org, repo.name).then(function(repoStats) {
        stats.repoStats[repo.name] = repoStats;
        Object.keys(repoStats).forEach(function(username) {
          if (Object.keys(stats.userStats).indexOf(username) <
            0)
            stats.userStats[username] = 0;
          stats.userStats[username] += repoStats[username];
        });
      });
    }));
  }).then(function() {
    return stats;
  });
}

function isValidUsername(username) {
  return github.users.getForUser({
    username: username
  }).then(function(user) {
    return user != null;
  }).catch(function(error) {
    return false;
  });
}

// EXPORTS
module.exports.getStats = getStats;
module.exports.isValidUsername = isValidUsername;
