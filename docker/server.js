var ws = require('ws')
var websocket = require('websocket-stream')
var docker = require('./docker-browser-console')

var server = new ws.Server({port:10000})
console.log("starting server");
server.on('connection', function(socket) {
	console.log("new connection");
  socket = websocket(socket)
  // this will spawn the container and forward the output to the browser
  socket.pipe(docker('gpp')).pipe(socket)
})
