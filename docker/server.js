var ws = require('ws')
var websocket = require('websocket-stream')
var docker = require('./docker-browser-console')

var server = new ws.Server({port: 61599})
console.log("starting server");
server.on('connection', function(socket, request) {
     console.log("new connection");

     var cookies = parseCookies(request);

     socket.on('disconnect', function() {
          console.log('user disconnected');
     });

     socket = websocket(socket);

     var volumes = {};
     volumes['/home/maxchehab/www/genesis/docker/volumes/' + cookies.genesis_workspaceID] = '/home/genesis';

     socket.pipe(docker('gpp', {
          volumes
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
