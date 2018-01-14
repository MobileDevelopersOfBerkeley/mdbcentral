// var eventPromise = getEvents();
//
// var defaultEventPromise = getEvent();
//
// const max_events = 8;
//
// function getEventsSoFar() {
//   var start = null;
//   return semester_start_ref.once("value").then(function(snapshot) {
//     if (!snapshot.exists()) return firebase.Promise.reject(new Error(
//       "semester start not defined"));
//     return new Date(snapshot.val());
//   }).then(function(date) {
//     start = date;
//     return eventPromise;
//   }).then(function(events) {
//     events = events || [];
//     var result = [];
//     events.forEach(function(event) {
//       if (start.getTime() <= getEventDate(event).getTime())
//         result.push(event);
//     });
//     return result;
//   });
// }
//
// function getEvent() {
//   return eventPromise.then(function(events) {
//     var today = new Date();
//     var defaultEvent = null;
//     var minDiff = Number.MAX_VALUE;
//     for (var i = 0; i < events.length; i++) {
//       var event = events[i];
//       var event_start = getEventDate(event);
//       var currDiff = Math.abs(event_start - today);
//       if (currDiff < minDiff) {
//         defaultEvent = event;
//         minDiff = currDiff;
//       }
//     }
//     return defaultEvent;
//   });
// }
//
// function getEventDate(event) {
//   if (!event) return null;
//   if (!event.start) return null;
//   if (event.start.dateTime) return new Date(event.start.dateTime);
//   if (event.start.date) return new Date(event.start.date);
//   return null;
// }
//
// function getSignInCode() {
//   return sign_in_code_ref.once("value").then(function(snapshot) {
//     if (snapshot.exists()) return snapshot.val();
//     return "";
//   });
// }
//
// function getSignInMinutes() {
//   return sign_in_minutes_ref.once("value").then(function(snapshot) {
//     if (snapshot.exists()) return snapshot.val();
//     return 20;
//   });
// }
//
// function setSignInCode(code, minutes) {
//   if (code == "" || code == null) return firebase.Promise.reject(
//     "code can't be empty");
//   if (code.indexOf(" ") >= 0) return firebase.Promise.reject(
//     "code can't have space");
//   if (minutes == 0 || minutes == null) return firebase.Promise.reject(
//     "minutes cant be 0");
//   var plist = [];
//   plist.push(sign_in_code_ref.set(code));
//   plist.push(sign_in_minutes_ref.set(minutes));
//   return firebase.Promise.all(plist);
// }
//
// function getEventById(event_id) {
//   return eventPromise.then(function(events) {
//     for (var i = 0; i < events.length; i++) {
//       var event = events[i];
//       if (event.id == event_id) {
//         return event;
//       }
//     }
//     return firebase.Promise.reject("no event exists w/ id: " + event_id);
//   });
// }
//
// function queryByMember(ref, uid) {
//   return ref.orderByChild("member").equalTo(uid).once("value").then(function(
//     snapshot) {
//     var l = [];
//     if (!snapshot.exists()) return l;
//     var m = snapshot.val();
//     for (var key in m) {
//       l.push(m[key]);
//     }
//     return l;
//   });
// }
//
// function listAbsences(uid) {
//   return queryByMember(absence_ref, uid);
// }
//
// function listSignIns(uid) {
//   return queryByMember(signin_ref, uid);
// }
//
// function listAllExpectedAbsences() {
//   var result = [];
//   return member_ref.once("value").then(function(snapshot) {
//     var plist = [];
//     snapshot.forEach(function(childSnapshot) {
//       plist.push(listExpectedAbsences(childSnapshot.key).then(function(
//         expectedAbsences) {
//         expectedAbsences.forEach(function(expectedAbsence) {
//           expectedAbsence.name = childSnapshot.val().name;
//           result.push(expectedAbsence);
//         });
//       }));
//     });
//     return firebase.Promise.all(plist);
//   }).then(function() {
//     return result;
//   });
// }
//
// function listAllFeedback() {
//   var result = [];
//   return member_ref.once("value").then(function(snapshot) {
//     var plist = [];
//     snapshot.forEach(function(childSnapshot) {
//       plist.push(listFeedback(childSnapshot.key).then(function(
//         feedbacks) {
//         feedbacks.forEach(function(feedback) {
//           feedback.name = childSnapshot.val().name;
//           result.push(feedback);
//         });
//       }));
//     });
//     return firebase.Promise.all(plist);
//   }).then(function() {
//     return result;
//   });
// }
//
// function listExpectedAbsences(uid) {
//   return queryByMember(expected_absence_ref, uid);
// }
//
// function listFeedback(uid) {
//   return queryByMember(feedback_ref, uid);
// }
//
// function signin(uid, event_id, event_code) {
//   if (event_id == null || event_id.trim() == "" || event_code == null ||
//     event_code.trim() == "") {
//     return firebase.Promise.reject(
//       "Please select an event and provide sign in code.");
//   }
//   var event = null;
//   var milliseconds_after_start = 0;
//   return getSignInMinutes().then(function(minutes) {
//     milliseconds_after_start = minutes * 60 * 1000;
//     return getEventById(event_id);
//   }).then(function(eventt) {
//     event = eventt;
//     var today = new Date();
//     var event_start = getEventDate(event);
//     if (event_start > today) {
//       return firebase.Promise.reject("Event has not started yet");
//     }
//     if (event_start.getDate() != today.getDate()) {
//       return firebase.Promise.reject("Event does not happen today");
//     }
//     if (today.getTime() - event_start.getTime() > milliseconds_after_start) {
//       return firebase.Promise.reject(
//         "You are late! According to policy this counts as an absence.");
//     }
//     return signin_ref.orderByChild("member").equalTo(uid).once("value");
//   }).then(function(snapshot) {
//     var error = null;
//     if (snapshot.exists()) {
//       snapshot.forEach(function(childSnapshot) {
//         var signIn = childSnapshot.val();
//         if (signIn.id == event_id) {
//           error = firebase.Promise.reject("You have already signed in.");
//           return true;
//         }
//       });
//     }
//     return error;
//   }).then(function() {
//     return signin_ref.push().set({
//       id: event_id,
//       title: event.summary || event.title,
//       timestamp: new Date().getTime(),
//       member: uid,
//       code: event_code.trim()
//     }).catch(function(e) {
//       return firebase.Promise.reject("Incorrect sign in code.");
//     });
//   });
// }
//
// function getMaxAbsences(uid) {
//   return member_ref.child(uid).child("roleId").once("value").then(function(
//     snapshot) {
//     if (!snapshot.exists()) return 0;
//     var index = snapshot.val();
//     return role_ref.child(index).child("maxAbsences").once("value").then(
//       function(snapshot) {
//         if (!snapshot.exists()) return 0;
//         return snapshot.val();
//       });
//   });
// }
//
// function getSummaryBarData() {
//   var signinMap = {};
//   var absenceMap = {};
//   var expectedAbsenceMap = {};
//
//   function mappifyTotals(ref) {
//     var result = {};
//     return ref.once("value").then(function(snapshot) {
//       if (!snapshot.exists()) return result;
//       var x = snapshot.val();
//       for (var key in x) {
//         var idd = x[key].id;
//         if (idd in result) {
//           result[idd] += 1;
//         } else {
//           result[idd] = 1;
//         }
//       }
//       return result;
//     });
//   }
//
//   var defaultEvent = {};
//
//   return mappifyTotals(signin_ref).then(function(x) {
//     signinMap = x;
//     return mappifyTotals(absence_ref);
//   }).then(function(x) {
//     absenceMap = x;
//     return mappifyTotals(expected_absence_ref);
//   }).then(function(x) {
//     expectedAbsenceMap = x;
//     return defaultEventPromise;
//   }).then(function(defaultEventt) {
//     defaultEvent = defaultEventt;
//     return eventPromise;
//   }).then(function(events) {
//     events = events || [];
//     var event_titles = [];
//     var attendances = [];
//     var absences = [];
//     var expectedAbsences = [];
//
//     var today_timestamp = new Date().getTime();
//     var defaultEvent_timestamp = getEventDate(defaultEvent).getTime();
//
//     var defaultEventIndex = 0;
//     for (var i = 0; i < events.length; i++) {
//       var event = events[i];
//       if (event.id == defaultEvent.id) {
//         defaultEventIndex = i;
//         break;
//       }
//     }
//
//     if (events.length > max_events) {
//       var beginFilterIndex = defaultEventIndex - 2;
//       var endFilterIndex = beginFilterIndex + max_events;
//       events = events.slice(beginFilterIndex, endFilterIndex);
//       // if (beginFilterIndex >= 0 && endFilterIndex < events.length) {
//       // 	events = events.slice(beginFilterIndex, endFilterIndex);
//       // }
//     }
//
//     for (var i = 0; i < events.length; i++) {
//       var event = events[i];
//       var title = event.title || event.summary;
//       title = dateToStringShort(getEventDate(event)) + " - " + title;
//       event_titles.push(title);
//       attendances.push(signinMap[event.id]);
//       absences.push(absenceMap[event.id]);
//       expectedAbsences.push(expectedAbsenceMap[event.id]);
//     }
//
//     return [
//       event_titles, [
//         attendances,
//         absences,
//         expectedAbsences
//       ]
//     ]
//   });
// }
//
// function deleteExpectedAbsence(expectedAbsence) {
//   return expected_absence_ref.orderByChild("member").equalTo(expectedAbsence.member)
//     .once("value").then(function(snapshot) {
//       if (!snapshot.exists()) return firebase.Promise.reject(new Error(
//         "expected absence does not exist"));
//       var p = firebase.Promise.resolve(true);
//       snapshot.forEach(function(childSnapshot) {
//         p = expected_absence_ref.child(childSnapshot.key).set(null);
//         return true;
//       });
//       return p;
//     });
// }
//
// function submitExpectedAbsence(uid, eventId, reason) {
//   if (uid == null || uid == "") {
//     return firebase.Promise.reject(new Error("please fill in uid"));
//   }
//   if (eventId == null || eventId == "") {
//     return firebase.Promise.reject(new Error("please select event"));
//   }
//   if (reason == null || reason.trim() == "") {
//     return firebase.Promise.reject(new Error("please fill in reason"));
//   }
//   reason = reason.trim();
//   return expected_absence_ref.orderByChild("member").equalTo(uid).once(
//     "value").then(function(snapshot) {
//     if (snapshot.exists()) {
//       var exists = false;
//       snapshot.forEach(function(childSnapshot) {
//         var expectedAbsence = childSnapshot.val();
//         if (expectedAbsence.id == eventId) {
//           exists = true;
//           return true;
//         }
//       });
//       if (exists) return firebase.Promise.reject(new Error(
//         "you have already submitted an expected absence for this event"
//       ));
//     }
//     return getEventById(eventId);
//   }).then(function(event) {
//     return expected_absence_ref.push().set({
//       id: eventId,
//       reason: reason,
//       member: uid,
//       timestamp: getEventDate(event).getTime(),
//       title: event.title || event.summary
//     });
//   });
// }
//
// function submitFeedback(uid, eventId, response) {
//   if (uid == null || uid == "") {
//     return firebase.Promise.reject(new Error("please fill in uid"));
//   }
//   if (eventId == null || eventId == "") {
//     return firebase.Promise.reject(new Error("please select event"));
//   }
//   if (response == null || response.trim() == "") {
//     return firebase.Promise.reject(new Error("please fill in response"));
//   }
//   response = response.trim();
//   return getEventById(eventId).then(function(event) {
//     return feedback_ref.push().set({
//       id: eventId,
//       title: event.title || event.summary,
//       timestamp: new Date().getTime(),
//       member: uid,
//       response: response
//     });
//   });
// }
//
// return {
//   listAllFeedback: listAllFeedback,
//   submitFeedback: submitFeedback,
//   getEventsSoFar: getEventsSoFar,
//   submitExpectedAbsence: submitExpectedAbsence,
//   deleteExpectedAbsence: deleteExpectedAbsence,
//   getMaxAbsences: getMaxAbsences,
//   getEvent: getEvent,
//   getSignInCode: getSignInCode,
//   getSignInMinutes: getSignInMinutes,
//   setSignInCode: setSignInCode,
//   listAbsences: listAbsences,
//   listSignIns: listSignIns,
//   listExpectedAbsences: listExpectedAbsences,
//   listAllExpectedAbsences: listAllExpectedAbsences,
//   signin: signin,
//   getSummaryBarData: getSummaryBarData
// }
