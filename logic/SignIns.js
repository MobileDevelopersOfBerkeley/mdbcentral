// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;
const util = require("../util/util.js");
const eventLogic = require("../logic/Events.js");
const memberLogic = require("../logic/Members.js");

// CONSTANTS
const ref = dbUtil.refs.signInRef;

// METHODS
function create(params) {
  return eventLogic.getByToday().then(function(event) {
    return dbUtil.createByAutoKey(ref, {
      eventId: event._key,
      member: params.member,
      code: params.code
    });
  });
}

function createManual(params) {
  return dbUtil.createByAutoKey(ref, {
    eventId: params.eventId,
    member: params.member,
    code: params.code
  });
}

function getAttendanceByEvent(params) {
  return eventLogic.getAll().then(function(events) {
    var eList = events.filter(function(event) {
      return event.title.similar(params.title);
    });
    if (eList.length == 0) return Promise.reject(new Error(
      "no event with title similar to " + params.title));
    var eventKey = events[0]._key;
    return getAllAttendance().then(function(data) {
      Object.keys(data).forEach(function(member) {
        var dat = data[member];
        var signIns = dat.signIns;
        var absences = dat.absences;
        data[member] = {
          signIns: signIns.filter(function(signIn) {
            return eventKey == signIn.eventId;
          }),
          absences: absences.filter(function(event) {
            return eventKey == event._key;
          })
        };
      });
      return data;
    });
  });
}

function getAttendanceByName(params) {
  return memberLogic.getAll().then(function(members) {
    var mList = members.filter(function(member) {
      return member.name.similar(params.name);
    });
    if (mList.length == 0) return Promise.reject(new Error(
      "no member with name similar to " + params.name));
    var member = members[0]._key;
    return getAllAttendance().then(function(data) {
      var x = {};
      x[member] = data[member];
      return x;
    });
  });
}

function getAllAttendance() {
  var events, members;
  return eventLogic.getAll().then(function(eList) {
    var today = util.getUnixTS();
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
        var e = events.filter(function(event) {
          return event._key == signIn.eventId;
        });
        return signIn.member == member && e.length > 0;
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
module.exports.createManual = createManual;
module.exports.create = create;
module.exports.getAllAttendance = getAllAttendance;
module.exports.getAttendanceByEvent = getAttendanceByEvent;
module.exports.getAttendanceByName = getAttendanceByName;
