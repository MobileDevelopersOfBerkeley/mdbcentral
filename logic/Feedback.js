// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const memberLogic = require("./Members.js");

// CONSTANTS
const ref = dbUtil.refs.feedbackRef;

// METHODS
function getAll() {
  var result = [];
  return memberLogic.getAll().then(function(users) {
    return Promise.all(users.map(function(user) {
      return dbUtil.getObjectsByFields(ref, {
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
  // TODO: implement this w/o Welcome API
  return Promise.reject(new Error("SHREYA PLZ IMPLEMENT ME"));
  // return getEventById({
  //   id: params.eventId
  // }).then(function(event) {
  //   return dbUtil.createNewObjectByAutoId(ref, {
  //     id: params.eventId,
  //     title: event.title || event.summary,
  //     timestamp: new Date().getTime(),
  //     member: params.member,
  //     response: params.response
  //   });
  // });
}

// EXPORTS
module.exports.create = create;
module.exports.getAll = getAll;
