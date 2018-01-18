// DEPENDENCIES
const regression = require("regression");

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

function getProjectedPoints(data, shiftConstant) {
  shiftConstant = shiftConstant || 2;
  var xVals = data.map(function(point) {
    return point[0]
  });
  var diff = xVals[xVals.length - 1] - xVals[0];
  data = data.map(function(point) {
    point[0] = parseFloat(point[0]);
    point[0] += shiftConstant * diff;
    return point;
  });
  var result = regression.linear(data);
  var c = result.equation[0];
  var b = result.equation[1];
  return data.map(function(point) {
    point[1] = c * point[0] + b;
    return point;
  });
}

// EXPORTS
module.exports.getProjectedPoints = getProjectedPoints;
module.exports.dateToString = dateToString;
module.exports.parseBool = parseBool;
