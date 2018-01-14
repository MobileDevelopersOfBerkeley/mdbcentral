var google_calendar_api_key = "AIzaSyBR23JsMKVvRqPmgJLYcTBVVj1QXYWbv9M";

function loadGCal() {
  $('#calendar').fullCalendar({
    theme: true,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    displayEventTime: false, // don't show the time column in list view
    eventClick: function(event) {
      // opens events in a popup window
      window.open(event.url, 'gcalevent', 'width=700,height=600');
      return false;
    },
    googleCalendarApiKey: google_calendar_api_key,
    events: {
      googleCalendarId: 'contact@mobiledevsberkeley.org'
    }
  });
  $('#next-month').click(function() {
    $('#calendar').fullCalendar('next');
  });
  $('#prev-month').click(function() {
    $('#calendar').fullCalendar('prev');
  });
}

function getEvents() {
  var url = "https://www.googleapis.com/calendar/v3/calendars/contact%40mobiledevsberkeley.org/events?orderBy=startTime&key=" + google_calendar_api_key + "&singleEvents=true";
  return $.ajax({
    url: url,
    dataType: "json"
  }).then(function(events) {
    return events.items;
  });
}