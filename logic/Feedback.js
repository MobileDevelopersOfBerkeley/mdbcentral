// DEPENDENCIES
const getUnixTS = require("../util/util.js").getUnixTS;
const dbUtil = require("../util/firebase.js").db;
const memberLogic = require("./Members.js");
const eventLogic = require("./Events.js");

// CONSTANTS
const ref = dbUtil.refs.feedbackRef;

// METHODS
function getAll() {
  var result = [];
  return memberLogic.getAll().then(function(users) {
    return Promise.all(users.map(function(user) {
      return dbUtil.getByFields(ref, {
        member: user._key
      }).then(function(feedbacks) {
        feedbacks.forEach(function(feedback) {
          feedback.name = user.name;
          result.push(feedback);
        });
      })
    }));
  }).then(function() {
    return result;
  });
}

function create(params) {
  return eventLogic.getById({
    id: params.eventId
  }).then(function(event) {
    return dbUtil.createByAutoKey(ref, {
      id: params.eventId,
      title: event.title,
      timestamp: getUnixTS(),
      member: params.member,
      response: params.response
    });
  });
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
