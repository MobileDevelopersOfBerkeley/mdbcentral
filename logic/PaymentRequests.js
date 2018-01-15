// DEPENDENCIES
const dbUtil = require("../util/firebase/db.js");
const storageUtil = require("../util/firebase/storage.js");
const memberLogic = require("./Members.js");

// CONSTANTS
const ref = dbUtil.refs.paymentRequestRef;

// METHODS
function createChargeRequest(params) {
  return dbUtil.createNewObjectByAutoId(ref, {
    type: "charge",
    dollars: params.dollars,
    message: params.message,
    members: params.members
  });
}

function createReimbursementRequest(params) {
  return storageUtil.upload(params.image).then(function(url) {
    return dbUtil.createNewObjectByAutoId(ref, {
      type: "reimbursement",
      dollars: params.dollars,
      message: params.message,
      member: params.member,
      imageUrl: url
    });
  });
}

function completeCharge(params) {
  return dbUtil.getByKey(ref, params.id).then(function(request) {
    if (request.type != "charge")
      return Promise.reject(new Error("Invalid id"));
    return memberLogic.charge({
      member: params.member,
      dollars: request.dollars,
      desc: request.message
    });
  });
}

function completeReimbursement(params) {
  return dbUtil.getByKey(ref, params.id).then(function(request) {
    if (request.type != "reimbursement")
      return Promise.reject(new Error("Invalid id"));
    return memberLogic.transfer({
      member: request.member,
      dollars: request.dollars,
      type: "reimbursement"
    });
  });
}


// EXPORTS
module.exports.createChargeRequest = createChargeRequest;
module.exports.createReimbursementRequest = createReimbursementRequest;
module.exports.completeReimbursement = completeReimbursement;
module.exports.completeCharge = completeCharge;
