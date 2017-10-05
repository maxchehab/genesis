var docker = require('./docker-browser-console')
var websocket = require('websocket-stream')

// create a stream for any docker image
// use docker({style:false}) to disable default styling
// all other options are forwarded to the term.js instance
var terminal = docker()

// connect to a docker-browser-console server
terminal.pipe(websocket('ws://104.236.141.69:10000')).pipe(terminal)

// append the terminal to a DOM element
terminal.appendTo(document.getElementById("terminal"));
