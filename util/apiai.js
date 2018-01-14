// DEPENDENCIES
const apiai = require('apiai');
const config = require("../conf/config.json");

// SETUP
var app = apiai(config.apiaiKey);
var options = {
	sessionId: config.apiaiSessionID
};

// METHODS
function chat(message) {
	return new Promise(function(resolve, reject) {
		var request = app.textRequest(message, options);

		request.on('response', function(response) {
			resolve(response);
		});

		request.on('error', function(error) {
			reject(error);
		});

		request.end();
	});
}

// EXPORTS
module.exports.chat = chat;
