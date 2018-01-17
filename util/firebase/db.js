// DEPENDENCIES
const firebase = require("./fb.js");
const util = require("../util.js");

// REFS
const rootRef = firebase.database().ref();
const refs = {};
refs.memberRef = rootRef.child("Members");
refs.githubCacheRef = rootRef.child("GithubCache");
refs.bigLittleRef = rootRef.child("BigLittleContest");
refs.assignmentRef = rootRef.child("Assignments");
refs.scoreRef = rootRef.child("Scores");
refs.roleRef = rootRef.child("Roles");
refs.expectedAbsenceRef = rootRef.child("ExpectedAbsences");
refs.feedbackRef = rootRef.child("Feedback");
refs.paymentRequestRef = rootRef.child("PaymentRequests");
refs.finReportRef = rootRef.child("FinReports");
refs.semesterStartRef = rootRef.child("semesterStart");
refs.canSignUpRef = rootRef.child("canSignUp");

// HELPER
function _multipleCallback(snapshot) {
	if (!snapshot.exists()) return [];
	var result = [];
	snapshot.forEach(function(childSnapshot) {
		var obj = childSnapshot.val();
		obj._key = childSnapshot.key;
		obj._parentNode = snapshot.ref.key;
		result.push(obj);
	});
	return result;
}

// METHODS
function listenForQueryCallback(pathStr, childParam, childValue,
	objCb) {
	function genCb(type) {
		return function(snapshot) {
			var obj = snapshot.val();
			if (!childParam || !childValue || obj[childParam] == childValue) {
				obj._key = snapshot.key;
				obj._event = type;
				objCb(obj);
			}
		}
	}
	var ref;
	if (pathStr.indexOf("_") < 0)
		ref = rootRef.child(pathStr);
	else {
		ref = rootRef;
		pathStr.split("_").forEach(function(nodeStr) {
			ref = ref.child(nodeStr);
		});
	}
	ref.on("child_removed", genCb("removed"));
	ref.on("child_added", genCb("added"));
	ref.on("child_changed", genCb("changed"));
}

function getAll(ref) {
	return ref.once("value").then(_multipleCallback);
}

function getAllStartsWith(ref, childParam, childValue) {
	return ref.orderByChild(childParam).startAt(childValue)
		.endAt(childValue + "\uf8ff").once("value").then(_multipleCallback);
}

function getAllWithBounds(ref, fieldToBound) {
	var primaryField = Object.keys(fieldToBound)[0];
	var primaryBound = fieldToBound[primaryField];
	return ref.orderByChild(primaryField).startAt(primaryBound[0])
		.endAt(primaryBound[1]).once("value").then(_multipleCallback)
		.then(function(objects) {
			return objects.filter(function(object) {
				return Object.keys(fieldToBound).reduce(function(bool, key) {
					var bound = fieldToBound[key];
					var objectVal = object[key];
					if (objectVal < bound[0] || objectVal > bound[1])
						return false;
					return true;
				}, true);
			});
		});
}

function checkIfAllKeysExist(ref, keys) {
	var plist = [];
	var exists = true;
	keys.forEach(function(key) {
		plist.push(ref.child(key).once("value").then(function(snapshot) {
			if (!snapshot.exists()) exists = false;
		}));
	});
	return Promise.all(plist).then(function() {
		return exists;
	});
}

function remove(ref, key) {
	return ref.child(key).remove();
}

function getByKey(ref, key) {
	return ref.child(key).once("value").then(function(snapshot) {
		if (!snapshot.exists())
			return Promise.reject("Object with id " + key +
				" does not exist in the database");
		var obj = snapshot.val();
		obj._key = key;
		obj._parentNode = ref.key;
		return obj;
	});
}

function getAllByKeys(ref, keys) {
	return getAll(ref).then(function(objs) {
		return objs.filter(function(obj) {
			return keys.indexOf(obj._key) >= 0;
		});
	});
}

function doTransaction(ref, transFunc) {
	return new Promise(function(resolve, reject) {
		ref.transaction(transFunc, function(error, committed, snapshot) {
			if (error)
				reject(error);
			else if (!committed)
				reject(new Error("transaction not committed!"));
			else if (snapshot.exists()) {
				var obj = snapshot.val();
				obj._key = snapshot.key;
				obj._parentNode = snapshot.ref.key;
				resolve(obj);
			} else {
				resolve(null);
			}
		}, true);
	});
}

function getAllLessThan(ref, childParam, value) {
	return ref.orderByChild(childParam).endAt(value).once("value")
		.then(_multipleCallback);
}

function getAllGreaterThan(ref, childParam, value) {
	return ref.orderByChild(childParam).startAt(value).once("value")
		.then(_multipleCallback);
}

function updateObject(ref, id, fieldToVal) {
	var unixTS = new Date().getTime();
	fieldToVal["lastUpdated"] = unixTS;
	return ref.child(id).update(fieldToVal).then(function() {
		return getByKey(ref, id);
	});
}

function getObjectsByFields(ref, fieldToVal) {
	var primaryField = Object.keys(fieldToVal)[0];
	var primaryVal = fieldToVal[primaryField];
	return ref.orderByChild(primaryField).equalTo(primaryVal).once("value")
		.then(_multipleCallback).then(function(objects) {
			return objects.filter(function(object) {
				for (var key in Object.keys(fieldToVal)) {
					var val = fieldToVal[key];
					if (object[key] !== val)
						return false;
				}
				return true;
			});
		});
}

function createNewObjectByAutoId(ref, object) {
	var unixTS = new Date().getTime();
	object["lastUpdated"] = unixTS;
	var newRef = ref.push();
	return newRef.set(object).then(function() {
		object["_key"] = newRef.key;
		object["_parentNode"] = ref.key;
		return object;
	}).catch(function(error) {
		return Promise.reject("Unable to create object in database");
	});
}

function createNewObject(ref, object, id) {
	var unixTS = new Date().getTime();
	object["lastUpdated"] = unixTS;
	return ref.child(id).set(object).then(function() {
		object["_key"] = id;
		object["_parentNode"] = ref.key;
		return object;
	}).catch(function(error) {
		return Promise.reject("Unable to create object in database");
	});
}

// EXPORTS
module.exports.listenForQueryCallback = listenForQueryCallback;
module.exports.refs = refs;
module.exports.remove = remove;
module.exports.getAll = getAll;
module.exports.checkIfAllKeysExist = checkIfAllKeysExist;
module.exports.getByKey = getByKey;
module.exports.doTransaction = doTransaction;
module.exports.getAllByKeys = getAllByKeys;
module.exports.getAllLessThan = getAllLessThan;
module.exports.getAllWithBounds = getAllWithBounds;
module.exports.getAllStartsWith = getAllStartsWith;

module.exports.getAllGreaterThan = getAllGreaterThan;
module.exports.updateObject = updateObject;
module.exports.getObjectsByFields = getObjectsByFields;
module.exports.createNewObjectByAutoId = createNewObjectByAutoId;
module.exports.createNewObject = createNewObject;
