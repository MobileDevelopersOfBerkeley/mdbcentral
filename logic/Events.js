// DEPENDENCIES
const welcomeLogic = require("./Welcome.js");
const config = require("../conf/config.json");

// CONSTANTS
const max_events = 8;

// HELPERS
function _getEventDate(event) {
  if (!event) return null;
  if (!event.start) return null;
  if (event.start.dateTime) return new Date(event.start.dateTime);
  if (event.start.date) return new Date(event.start.date);
  return null;
}

// METHODS
function getEventsSoFar() {
  var start = new Date(config.semesterStart);
  return welcomeLogic.getEvents().then(function(events) {
    events = events || [];
    return events.filter(function(event) {
      return start.getTime() <= _getEventDate(event).getTime();
    });
  });
}

function getEvent() {
  return welcomeLogic.getEvents().then(function(events) {
    var today = new Date();
    var defaultEvent = null;
    var minDiff = Number.MAX_VALUE;
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var event_start = _getEventDate(event);
      var currDiff = Math.abs(event_start - today);
      if (currDiff < minDiff) {
        defaultEvent = event;
        minDiff = currDiff;
      }
    }
    return defaultEvent;
  });
}

function getById(params) {
  return welcomeLogic.getEvents().then(function(events) {
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      if (event.id == params.id) {
        return event;
      }
    }
    return Promise.reject("no event exists w/ id: " + event_id);
  });
}

// EXPORTS
module.exports.getEventsSoFar = getEventsSoFar;
module.exports.getEvent = getEvent;
module.exports.getById = getById;
