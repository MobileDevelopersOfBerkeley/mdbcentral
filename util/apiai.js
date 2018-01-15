// DEPENDENCIES
const apiai = require('apiai');

// SETUP
var app = apiai(process.env.APIAI_KEY);
var options = {
	sessionId: process.env.APIAI_SESSION_ID
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
