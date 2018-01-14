const host_api = "http://legacy-api.welcomeme.io/";

function _success(resolve, reject) {
  return function(response) {
    if (response.status == 200) resolve(response.result);
    else reject(response);
  }
}

function _error(reject) {
  return function(error) {
    if (!error.responseJSON)
      reject(new Error(JSON.stringify(error)));
    else if (error.responseJSON.message)
      reject(new Error(error.responseJSON.message));
    else
      reject(error.responseJSON.error);
  }
}

function _request(type, route, params) {
  return new Promise(function(resolve, reject) {
    var call = {
      url: host_api + route,
      type: type,
      contentType: "application/json",
      success: _success(resolve, reject),
      error: _error(reject)
    };
    if (params) {
      call.data = JSON.stringify(params);
      call.dataType = "json";
    }
    $.ajax(call);
  });
}

function _get(route) {
  return _request("GET", route);
}

function listAbsences(member) {
  var events, welcomeUid;
  return _getWelcomeUid(member).then(function(x) {
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

function listSignIns(member) {
  var events, welcomeUid;
  return _getWelcomeUid(member).then(function(x) {
    welcomeUid = x;
    return getEvents()
  }).then(function(x) {
    events = x;
    return _get("signIns?userId=" + welcomeUid)
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
  return _get("events?eventOrganizationId=keyForMDB")
    .then(function(events) {
      return events.filter(function(event) {
        return event.isAttendance === true;
      }).map(function(event) {
        event.timestamp = event.startTime * 1000;
        event.id = event._key;
        return event;
      });
    });
}

function _getWelcomeUid(member) {
  return _get("anonUsers?email=" + member.email).catch(function(error) {
    return _get("users?fullName=" + member.fullName)
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

return {
  listAbsences: listAbsences,
  listSignIns: listSignIns,
  getEvent: getEvent,
  getEvents: getEvents
}
