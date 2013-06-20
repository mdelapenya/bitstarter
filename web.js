var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send('<h1>Hello World!</h1><p>This is my first Node.js application written for Stanford Startup Engineering course</p>');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
