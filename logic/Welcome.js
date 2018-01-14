// DEPENDENCIES
const request = require("request");

// CONSTANTS
const host_api = require("../conf/config.json").welcomeEndpoint;

// HELPERS
function _request(type, route, params) {
  var options = {
    url: host_api + route,
    method: type
  };
  if (params) {
    options.json = true;
    options.form = params;
  }
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) reject(error);
      else if (response.error) reject(response.error);
      else if (body.error) reject(body.error);
      else if (response.statusCode && String(response.statusCode).charAt(
          0) != "2") reject(body);
      else resolve(body.result);
    });
  });
}

function _get(route) {
  return _request("GET", route);
}

function _getWelcomeUid(user) {
  return _get("/anonUsers?email=" + user.email).catch(function(error) {
    return _get("/users?fullName=" + user.fullName)
      .then(function(users) {
        if (users.length == 0)
          return Promise.reject(new Error(
            "You do not exist on welcome yet."));
        return users[0];
      });
  }).then(function(user) {
    return user._key;
  });
}

// METHODS
function listAbsences(params) {
  var events, welcomeUid;
  return _getWelcomeUid(params.user).then(function(x) {
    welcomeUid = x;
    return getEvents();
  }).then(function(x) {
    events = x;
    return listSignIns(member);
  }).then(function(signIns) {
    var eventIdsBeenTo = signIns.map(function(signIn) {
      return signIn.eventId;
    });
    return events.filter(function(event) {
      return eventIdsBeenTo.indexOf(event._key) < 0;
    });
  });
}

function listSignIns(params) {
  var events, welcomeUid;
  return _getWelcomeUid(params.user).then(function(x) {
    welcomeUid = x;
    return getEvents()
  }).then(function(x) {
    events = x;
    return _get("/signIns?userId=" + welcomeUid)
  }).then(function(signIns) {
    return signIns.map(function(signIn) {
      signIn.timestamp = signIn.time * 1000;
      var eventsFiltered = events.filter(function(event) {
        return event._key == signIn.eventId;
      });
      if (eventsFiltered.length > 0)
        signIn.title = eventsFiltered[0].title;
      else
        signIn.title = "???";
      return signIn;
    }).filter(function(signIn) {
      return signIn.title != "???";
    });
  });
}

function getEvent() {
  var today = Math.floor(new Date().getTime() / 1000);
  return getEvents().then(function(events) {
    var defaultEvent = null;
    var minDiff = Number.MAX_VALUE;
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var event_start = event.startTime;
      var currDiff = Math.abs(event_start - today);
      if (currDiff < minDiff) {
        defaultEvent = event;
        minDiff = currDiff;
      }
    }
    return defaultEvent;
  });
}

function getEvents() {
  return _get("/events?eventOrganizationId=keyForMDB")
    .then(function(events) {
      events = events || [];
      return events.filter(function(event) {
        return event.isAttendance === true;
      }).map(function(event) {
        event.timestamp = event.startTime * 1000;
        event.id = event._key;
        return event;
      });
    });
}

// EXPORTS
module.exports.listAbsences = listAbsences;
module.exports.listSignIns = listSignIns;
module.exports.getEvent = getEvent;
module.exports.getEvents = getEvents;
