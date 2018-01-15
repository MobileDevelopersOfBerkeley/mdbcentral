// DEPENDENCIES
var stripe = require("stripe")("sk_test_Tv1x0zuZ1ffSDbNDaNGFJSsO");

// HELPERS
function _cb(resolve, reject) {
  return function(err, obj) {
    if (err) reject(err);
    else resolve(obj.id);
  }
}

function _promisify(fn, param) {
  return new Promise(function(resolve, reject) {
    fn(param, _cb(resolve, reject));
  });
}

function _promisifyDoubleParam(fn, param1, param2) {
  return new Promise(function(resolve, reject) {
    fn(param1, param2, _cb(resolve, reject));
  });
}

function _createExtAccount(accountId, token) {
  return _promisifyDoubleParam(stripe.accounts.createExternalAccount,
    accountId, {
      external_account: token
    });
}

function _deleteExtAccount(accountId, cardId) {
  return _promisifyDoubleParam(stripe.accounts.deleteExternalAccount,
    accountId, cardId);
}

function _getExtAccountId(accountId) {
  return _promisify(stripe.accounts.retrieve, accountId)
    .then(function(account) {
      if (account.external_accounts.total_count == 0) {
        return Promise.reject(new Error(
          "account does not have any external accounts"));
      }
      return account.external_accounts.data[0].id;
    });
}

// METHODS
function createAccount(email) {
  return _promisify(stripe.accounts.create, {
    type: 'custom',
    country: 'US',
    email: email
  });
}

function updateAccountCard(accountId, token) {
  return _promisify(stripe.accounts.retrieve, accountId)
    .then(function(account) {
      if (account.external_accounts.total_count > 0) {
        var extAcc = account.external_accounts.data[0];
        return _deleteExtAccount(accountId, extAcc.id);
      }
    }).then(function() {
      return _createExtAccount(accountId, token);
    });
}

function charge(accountId, dollars, desc) {
  return _getExtAccountId(accountId).then(function(cardId) {
    return _promisify(stripe.charges.create, {
      amount: dollars * 100,
      currency: "usd",
      source: cardId,
      description: desc
    });
  });
}

function payout(dollars, desc) {
  return _promisify(stripe.payouts.create, {
    amount: dollars * 100,
    currency: "usd"
  });
}

function transfer(accountId, dollars, type) {
  return _promisify(stripe.transfers.create, {
    amount: dollars * 100,
    currency: "usd",
    destination: accountId,
    transfer_group: type
  });
}

// EXPORTS
module.exports.createAccount = createAccount;
module.exports.updateAccountCard = updateAccountCard;
module.exports.charge = charge;
module.exports.payout = payout;
module.exports.transfer = transfer;
