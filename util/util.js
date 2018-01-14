// METHODS
function getCurrUnixTimeStamp() {
  return Math.round(new Date().getTime() / 1000);
}

function parseBool(val) {
  return val === "true" || val === true ? true : false
}

// EXPORTS
module.exports.parseBool = parseBool;
module.exports.getCurrUnixTimeStamp = getCurrUnixTimeStamp;
