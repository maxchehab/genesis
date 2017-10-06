var ws = require('ws')
var websocket = require('websocket-stream')
var docker = require('./docker-browser-console')

var server = new ws.Server({port: 10000})
console.log("starting server");
server.on('connection', function(socket) {
     console.log("new connection");
     socket = websocket(socket)
     // this will spawn the container and forward the output to the browser
     var volume = __dirname + '/volume';

     socket.pipe(docker('gpp', {
          volumes: {
               '/home/maxchehab/www/genesis/docker/volume': '/genesis'
          }
     })).pipe(socket)
})
