function loadGCal(events) {
  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,basicWeek,basicDay'
    },
    defaultDate: new Date().toString(),
    navLinks: true,
    editable: false,
    eventLimit: true,
    events: events.map(function(event) {
      var d = new Date();
      d.setTime(event.timestamp);
      event.start = d.toString();
      return event;
    })
  });
  $('#next-month').click(function() {
    $('#calendar').fullCalendar('next');
  });
  $('#prev-month').click(function() {
    $('#calendar').fullCalendar('prev');
  });
}

function getEvents() {
  var url =
    "https://www.googleapis.com/calendar/v3/calendars/contact%40mobiledevsberkeley.org/events?orderBy=startTime&key=" +
    google_calendar_api_key + "&singleEvents=true";
  return $.ajax({
    url: url,
    dataType: "json"
  }).then(function(events) {
    return events.items;
  });
}
