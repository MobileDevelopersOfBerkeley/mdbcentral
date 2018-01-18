// DEPENDENCIES
const util = require("../util/util.js");
const rolesLogic = require("../logic/Roles.js");
const memberLogic = require("../logic/Members.js");

// HELPERS
function _getLiTag(currPage) {
  return function(page) {
    if (currPage != page) return "<li>";
    return "<li class='active'>";
  }
}

function _getCurrDateStr() {
  var d = new Date();
  return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
}

function _getMemberNames(members, ms) {
  var mList = members.filter(function(m) {
    return ms.indexOf(m._key) >= 0;
  });
  if (mList.length == 0) return "ALLNULL";
  return mList.map(function(m) {
    return m.name + ", ";
  });
}

function _getFirstName(name) {
  if (name.indexOf(" ") < 0) return name;
  return name.split(" ")[0];
}

function _getMemberName(members, member) {
  var mList = members.filter(function(m) {
    return m._key == member;
  });
  if (mList.length == 0) return "NULL";
  return mList[0].name;
}

// METHODS
function genData(currPage, uid) {
  var data = {
    getMemberNames: _getMemberNames,
    getMemberName: _getMemberName,
    timeToString: util.timeToString,
    getCurrDateStr: _getCurrDateStr,
    firstname: "Visitor",
    notifications: [],
    currPage: currPage,
    leadership: false,
    graphs: [],
    getLiTag: _getLiTag(currPage)
  };
  return rolesLogic.get().then(function(roles) {
    data.roles = roles;
    if (!uid) return Promise.resolve(data);
    return memberLogic.getById({
      id: uid
    }).then(function(user) {
      data.firstname = _getFirstName(user.name);
      data.leadership = user.leadership === true;
      data.user = user;
      return data;
    });
  });
}

// EXPORTS
module.exports.genData = genData;
