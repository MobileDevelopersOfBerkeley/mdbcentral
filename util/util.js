// METHODS
function parseBool(val) {
  return val === "true" || val === true ? true : false
}

function dateToString(date) {
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
}

// EXPORTS
module.exports.dateToString = dateToString;
module.exports.parseBool = parseBool;
