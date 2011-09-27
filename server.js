var sys    = require('sys'),
    http   = require('http'),
    ws     = require("./vendor/ws"),
    base64 = require('./vendor/base64'),
    arrays = require('./vendor/arrays');

// Command line args
var USERNAME = process.ARGV[2];
var PASSWORD = process.ARGV[3];
var KEYWORD  = process.ARGV[4] || "iphone";

if (!USERNAME || !PASSWORD)
  return sys.puts("Usage: node server.js <twitter_username> <twitter_password> <keyword>");

// Authentication Headers for Twitter
var auth = base64.encode(USERNAME + ':' + PASSWORD);
var headers = {
  'Authorization' : "Basic " + auth,
  'Host'          : "stream.twitter.com"
};

var clients = [];

// Connection to Twitter's streaming API
var twitter = http.createClient(80, "stream.twitter.com");
var request = twitter.request("GET", "/1/statuses/filter.json?track=" + KEYWORD, headers);


var message = "";

request.addListener('response', function (response) {
  response.setEncoding("utf8");
  
  response.addListener("data", function (chunk) {

		message += chunk;

		var newlineIndex = message.indexOf('\r');
		// response should not be sent until message includes '\r'.
		//		 Look at the section titled "Parsing Responses" in Twitter's documentation.
    	if (newlineIndex !== -1) {
        	var tweet = message.slice(0, newlineIndex);
        	clients.forEach(function(client) {
					// Send response to all connected clients
					client.write(tweet);
			});
        }
        message = message.slice(newlineIndex + 1);
    });

});
request.end();

// Websocket TCP server
ws.createServer(function (websocket) {
  clients.push(websocket);

  websocket.addListener("connect", function (resource) {
    // emitted after handshake
    sys.debug("connect: " + resource);
  }).addListener("close", function () {
    // emitted when server or client closes connection
    clients.remove(websocket);
    sys.debug("close");
  });
}).listen(8080);
