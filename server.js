var sys    = require('sys'),
    http   = require('http'),
    ws     = require("./vendor/ws"),     // Mininal websockets library
    base64 = require('./vendor/base64'); // Base64 encoding library

var USERNAME = '';
var PASSWORD = '';

var headers = [];
var auth = base64.encode(USERNAME + ':' + PASSWORD);
headers['Authorization'] = "Basic " + auth;
headers['Host'] = "stream.twitter.com";
//headers['Transfer-Encoding'] = "chunked";

ws.createServer(function (websocket) {
  
  // Connect to Twitter's streaming API
  var twitter = http.createClient(80, "stream.twitter.com");
  var request = twitter.request("GET", "/1/statuses/filter.json?track=iphone", headers);

  request.finish(function (response) {
    //sys.puts("STATUS: " + response.statusCode);
    //sys.puts("HEADERS: " + JSON.stringify(response.headers));
    response.setBodyEncoding("utf8");
    response.addListener("body", function (chunk) {
      // Send response to websocket clients
      websocket.send(chunk);
    });
  });


  websocket.addListener("connect", function (resource) { 
    // emitted after handshake
    sys.debug("connect: " + resource);
  }).addListener("close", function () { 
    // emitted when server or client closes connection
    sys.debug("close");
  });
}).listen(8080);
