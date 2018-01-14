// DEPENDENCIES
var promisifyRequest = require("./apicaller.js").promisifyRequest;
const config = require("../conf/config.json");

// CONSTANTS
const google_calendar_api_key = config.gcalKey;
const gcal_calendar = config.gcalCalendar;

// METHODS
function getEvents() {
  var url = "https://www.googleapis.com/calendar/v3/calendars/" + gcal_calendar +
    "/events?key=" + google_calendar_api_key + "&singleEvents=true";
  return promisifyRequest(url).then(function(response) {
    return JSON.parse(response).items;
  });
}

function getEventDate(event) {
  if (!event) return null;
  if (!event.start) return null;
  if (event.start.dateTime) return new Date(event.start.dateTime);
  if (event.start.date) return new Date(event.start.date);
  return null;
}

function getEventById(event_id) {
  return getEvents().then(function(events) {
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      if (event.id == event_id) {
        return event;
      }
    }
    return Promise.reject(new Error("no event exists w/ id: " + event_id));
  });
}

function getEventsSoFar(startDate) {
  return getEvents().then(function(events) {
    eventsSoFar = {};
    var today = new Date();
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var date = getEventDate(event);
      if (date.getTime() >= startDate.getTime() && date.getTime() <= today)
        eventsSoFar[event.id] = event;
    }
    return eventsSoFar;
  });
}

// EXPORTS
module.exports.getEventsSoFar = getEventsSoFar;
module.exports.getEventById = getEventById;
module.exports.getEvents = getEvents;
module.exports.getEventDate = getEventDate;
