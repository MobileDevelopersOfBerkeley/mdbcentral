// DEPENDENCIES
const Cleverbot = require('cleverbot-node');

// SETUP
var cleverbot = new Cleverbot;
cleverbot.configure({
	botapi: process.env.CLEVERBOT_KEY
});

// FUNCTIONS
function send(message) {
	return new Promise(function(resolve, reject) {
		cleverbot.write(message, function(response) {
			resolve(response.output);
		}, function(error) {
			reject(error);
		});
	});
}

// EXPORTS
module.exports.send = send;
