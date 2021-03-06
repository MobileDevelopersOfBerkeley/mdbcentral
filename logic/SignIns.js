// DEPENDENCIES
const dbUtil = require("../util/firebase.js").db;
const util = require("../util/util.js");
const eventLogic = require("../logic/Events.js");
const memberLogic = require("../logic/Members.js");
const getSemesterStart = require("../logic/SemesterStart.js").get;

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
    member: params.id,
    code: params.code
  });
}

function getAllManual() {
  return dbUtil.getByFields(ref, {
    code: "manual"
  });
}

function deleteById(params) {
  return dbUtil.deleteByKey(ref, params.id);
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
  var events, members, semesterStartTS;
  return getSemesterStart().then(function(ss) {
    semesterStartTS = new Date(ss).getTime();
    return eventLogic.getAll()
  }).then(function(eList) {
    var today = util.getUnixTS();
    events = eList.filter(function(event) {
      return event.timestamp <= today && event.attendance === true &&
        event.timestamp >= semesterStartTS;
    });
    return memberLogic.getAll();
  }).then(function(mList) {
    members = mList;
    return dbUtil.getAll(ref);
  }).then(function(signIns) {
    var data = {};
    members.forEach(function(member) {
      member = member._key;
      var sList = [];
      signIns.forEach(function(signIn) {
        var e = events.filter(function(event) {
          return event._key == signIn.eventId;
        });
        var added = sList.reduce(function(bool, x) {
          return bool || x.eventId == signIn.eventId;
        }, false);
        if (e.length > 0 && !added && signIn.member == member)
          sList.push(signIn);
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
module.exports.deleteById = deleteById;
module.exports.getAllManual = getAllManual;
module.exports.createManual = createManual;
module.exports.create = create;
module.exports.getAllAttendance = getAllAttendance;
module.exports.getAttendanceByEvent = getAttendanceByEvent;
module.exports.getAttendanceByName = getAttendanceByName;
