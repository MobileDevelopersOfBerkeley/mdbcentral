// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const util = require("../util/util.js");
const eventsLogic = require("./Events.js");
const userLogic = require("./Members.js");

// CONSTANTS
const ref = dbUtil.refs.expectedAbsenceRef;

// METHODS
function getAll() {
  var result = [];
  return userLogic.getAll().then(function(users) {
    return Promise.all(users.map(function(user) {
      return getByUid({
        userId: user._key
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
    userId: params.userId
  });
}

function deleteById(params) {
  return dbUtil.remove(ref, params.id);
}

function create(params) {
  return dbUtil.getObjectsByFields(ref, {
    userId: params.userId
  }).then(function(expectedAbsences) {
    if (expectedAbsences.length > 0) {
      return Promise.reject(new Error(
        "you have already submitted an expected absence for this event"
      ))
    }
    return eventsLogic.getById({
      id: params.eventId
    }).then(function(event) {
      return dbUtil.createNewObjectByAutoId(ref, {
        id: params.eventId,
        reason: params.reason,
        userId: params.userId,
        timestamp: new Date().getTime(),
        title: event.title || event.summary
      });
    });
  });
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
module.exports.getByUid = getByUid;
module.exports.deleteById = deleteById;
