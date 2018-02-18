// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;
const util = require("../util/util.js");
const memberLogic = require("./Members.js");
const eventLogic = require("./Events.js");
const getSemesterStart = require("./SemesterStart.js").get;

// CONSTANTS
const ref = dbUtil.refs.expectedAbsenceRef;

// METHODS
function getAll() {
  var result = [];
  return memberLogic.getAll().then(function(users) {
    return Promise.all(users.map(function(user) {
      return getByUid({
        member: user._key
      }).then(function(expectedAbsences) {
        expectedAbsences.forEach(function(expectedAbsence) {
          expectedAbsence.name = user.name;
          result.push(expectedAbsence);
        });
      })
    }));
  }).then(function() {
    return getSemesterStart();
  }).then(function(semesterStart) {
    var ts = new Date(semesterStart).getTime();
    return result.filter(function(x) {
      return x.lastUpdated >= ts;
    });
  });
}

function getByUid(params) {
  return dbUtil.getByFields(ref, {
    member: params.member
  });
}

function deleteById(params) {
  return dbUtil.deleteByKey(ref, params.id);
}

function create(params) {
  return dbUtil.getByFields(ref, {
    member: params.member
  }).then(function(expectedAbsences) {
    if (expectedAbsences.length > 0) {
      return Promise.reject(new Error(
        "you have already submitted an expected absence for this event"
      ))
    }
    return eventLogic.getById({
      id: params.eventId
    }).then(function(event) {
      return dbUtil.createByAutoKey(ref, {
        id: params.eventId,
        reason: params.reason,
        member: params.member,
        timestamp: util.getUnixTS(),
        title: event.title
      });
    });
  });
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getByUid = getByUid;
module.exports.deleteById = deleteById;
