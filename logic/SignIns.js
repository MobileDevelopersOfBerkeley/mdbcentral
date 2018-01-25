// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const eventLogic = require("../logic/Events.js");
const memberLogic = require("../logic/Members.js");

// CONSTANTS
const ref = dbUtil.refs.signInRef;

// METHODS
function create(params) {
  return dbUtil.createNewObjectByAutoId(ref, {
    eventId: params.eventId,
    member: params.member,
    code: params.code
  });
}

function getAllAttendance() {
  var events, members;
  return eventLogic.getAll().then(function(eList) {
    var today = new Date().getTime();
    events = eList.filter(function(event) {
      return event.timestamp <= today;
    });
    return memberLogic.getAll();
  }).then(function(mList) {
    members = mList;
    return dbUtil.getAll(ref);
  }).then(function(signIns) {
    var data = {};
    members.forEach(function(member) {
      member = member._key;
      var sList = signIns.filter(function(signIn) {
        return signIn.member == member;
      });
      var attendedEKeyList = sList.map(function(signIn) {
        return signIn.eventId;
      });
      var aList = events.filter(function(event) {
        return attendedEKeyList.indexOf(event._key) < 0;
      });
      data[member] = {
        signIns: sList,
        absences: aList
      };
    });
    return data;
  });
}

// EXPORTS
module.exports.create = create;
module.exports.getAllAttendance = getAllAttendance;
