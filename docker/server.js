const ws = require('ws')
const websocket = require('websocket-stream')
const docker = require('./docker-browser-console')
const querystring = require('querystring');

var server = new ws.Server({port: 61599})
console.log("starting server");
server.on('connection', function(socket, request) {
     console.log("new connection");

     socket.on('disconnect', function() {
          console.log('user disconnected');
     });

     socket = websocket(socket);

     let workspaceID = querystring.parse(request.url)["/?workspace"];
     console.log(workspaceID)
	
    
     var volumes = {};
     volumes['/home/maxchehab/www/genesis/docker/volumes/' + workspaceID] = '/home/genesis';

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
