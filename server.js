var http = require("http");
var url = require("url");
var util = require('util');

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");
        route(request, handle, pathname, response);
    }
    
    http.createServer(onRequest).listen(process.env.PORT); //use 'process.env.PORT' for code running within C9
    util.log("Server has started.");
}

exports.start = start;