var ws = require('ws')
var websocket = require('websocket-stream')
var docker = require('./docker-browser-console')

var server = new ws.Server({port: 61599})
console.log("starting server");
server.on('connection', function(socket, request) {
     console.log("new connection");

     var cookies = parseCookies(request);
     console.log(cookies.genesis_user + " : " + cookies.genesis_session);

     socket.on('disconnect', function() {
          console.log('user disconnected');
     });

     socket = websocket(socket)

     socket.pipe(docker('gpp', {
          volumes: {
               '/home/maxchehab/www/genesis/docker/volume': '/genesis'
          }
     })).pipe(socket)

})

function parseCookies(request) {
     var list = {},
          rc = request.headers.cookie;

     rc && rc.split(';').forEach(function(cookie) {
          var parts = cookie.split('=');
          list[parts.shift().trim()] = decodeURI(parts.join('='));
     });

     return list;
}
