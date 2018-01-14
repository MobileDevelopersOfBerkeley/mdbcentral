// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const userLogic = require("./Users.js");
const getEventById = require("./Events.js").getById;

// CONSTANTS
const ref = dbUtil.refs.feedbackRef;

// METHODS
function getAll() {
  var result = [];
  return userLogic.getAll().then(function(users) {
    return Promise.all(users.map(function(user) {
      return dbUtil.getObjectsByFields(ref, {
        userId: user._key
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
  return getEventById({
    id: params.eventId
  }).then(function(event) {
    return dbUtil.createNewObjectByAutoId(ref, {
      id: params.eventId,
      title: event.title || event.summary,
      timestamp: util.getCurrUnixTimeStamp(),
      userId: params.userId,
      response: params.response
    });
  });
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
