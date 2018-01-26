// DEPENDENCIES
const regression = require("regression");
const stringSimilarity = require("string-similarity");

// PROTOTYPES
String.prototype.includes = function(str) {
  return this.indexOf(str) >= 0;
}

String.prototype.similar = function(str) {
  var me = this.toLowerCase();
  var other = str.toLowerCase();
  if (me.startsWith(other) || me.endsWith(other)) return true;
  return stringSimilarity.compareTwoStrings(me, other) >= .7;
}

// METHODS
function genPieData(x, noStr) {
  var total = Object.keys(x).map(function(key) {
    return x[key];
  }).reduce(function(sum, ele, i, arr) {
    sum += ele;
    return sum;
  }, 0);
  var strs = [];
  var values = [];

  if (total <= 0) return [strs, values];

  for (var key in x) {
    var value = x[key]
    var percent = Math.ceil((value / total) * 100);
    if (percent > 0) {
      var percent_str = percent + "%";
      var str = "";
      if (!noStr)
        str = key + " (" + percent_str + ")";
      else
        str = percent_str + " (" + value + ")";
      strs.push(str);
      values.push(percent);
    }
  }
  return [strs, values];
}

function differentDay(d1, d2) {
  var day1 = d1.getDate();
  var day2 = d2.getDate();
  if (day1 != day2) return true;
  var month1 = d1.getMonth();
  var month2 = d2.getMonth();
  if (month1 != month2) return true;
  var year1 = d1.getFullYear();
  var year2 = d2.getFullYear();
  return year1 != year2;
}

function aggregateByX(data) {
  var newData = {};
  new Set(data.map(function(point) {
    return point[0];
  })).forEach(function(x) {
    data.forEach(function(point) {
      if (point[0] == x) {
        if (!(x in newData)) newData[x] = 0;
        newData[x] += point[1];
      }
    });
  });
  return Object.keys(newData).map(function(x) {
    return [x, newData[x]];
  });
}

function formatLineData(...dataList) {
  var xVals = dataList[0].map(function(tuple) {
    return tuple[0];
  });
  var yVals = dataList.map(function(data) {
    return data.map(function(tuple) {
      return tuple[1];
    })
  });
  return [xVals, yVals];
}

function timeToString(time, short, long) {
  var d = new Date();
  d.setTime(time);
  if (long) return d.toLocaleString();
  return dateToString(d, short);
}

function parseBool(val) {
  return val === "true" || val === true ? true : false
}

function dateToString(date, short) {
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  var val = date.getDate() + " " + monthNames[date.getMonth()];
  if (short) return val;
  return val + " " + date.getFullYear();
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
module.exports.genPieData = genPieData;
module.exports.differentDay = differentDay;
module.exports.aggregateByX = aggregateByX;
module.exports.formatLineData = formatLineData;
module.exports.timeToString = timeToString;
