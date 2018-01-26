// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const util = require("../util/util.js");
const memberLogic = require("./Members.js");
const eventLogic = require("./Events.js");

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
    return result;
  });
}

function getByUid(params) {
  return dbUtil.getObjectsByFields(ref, {
    member: params.member
  });
}

function deleteById(params) {
  return dbUtil.remove(ref, params.id);
}

function create(params) {
  return dbUtil.getObjectsByFields(ref, {
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
      return dbUtil.createNewObjectByAutoId(ref, {
        id: params.eventId,
        reason: params.reason,
        member: params.member,
        timestamp: new Date().getTime(),
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
