var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

//register routes
var handle = {};
handle["/"] = requestHandlers.main;
handle["/draw"] = requestHandlers.draw;
handle["/save"] = requestHandlers.save;
handle["/saved/"] = requestHandlers.openSaved;

handle["/test.html"] = function(response){requestHandlers.staticFile("./Static_Pages/Test.html","text/html",response);};

handle["/scripts/mainPage.js"] = function(response){requestHandlers.staticFile("./Scripts/mainPage.js","text/javascript",response);};
handle["/scripts/canvasDraw.js"] = function(response){requestHandlers.staticFile("./Scripts/canvasDraw.js","text/javascript",response);};
handle["/scripts/randomBackground.js"] = function(response){requestHandlers.staticFile("./Scripts/randomBackground.js","text/javascript",response);};

handle["/styles/canvasDraw.css"] = function(response){requestHandlers.staticFile("./CSS/canvasDraw.css","text/css",response);};
handle["/styles/MainPage.css"] = function(response){requestHandlers.staticFile("./CSS/MainPage.css","text/css",response);};
handle["/saved/styles/canvasDraw.css"] = function(response){requestHandlers.staticFile("./CSS/canvasDraw.css","text/css",response);};
server.start(router.route, handle);

function addToHandle(key, funcRoute)
{
    handle[key] = funcRoute;
}

exports.addToHandle = addToHandle;