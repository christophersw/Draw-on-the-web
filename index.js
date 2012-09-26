var server = require("./server"),
    router = require("./router"),
    requestHandlers = require("./requestHandlers"),
    util = require("util");
    
var intialized = false;

//register routes
var handle = {};

(function registerInitialRoutes(){
    if(!isHandle("/")) {
        addToHandle("/", requestHandlers.main);
    }
    if(!isHandle("/draw")) {
        addToHandle("/draw", requestHandlers.draw);
    }
    
    if(!isHandle("/save")) {
        addToHandle("/save", requestHandlers.save);
    }
    
    if(!isHandle("/saved")) {
        addToHandle("/saved/", requestHandlers.openSaved);
    }
    
    if(!isHandle("/test.html")) {
        addToHandle("/test.html", function(response){requestHandlers.staticFile("./Static_Pages/Test.html","text/html",response);});
    }
    
    if(!isHandle("/scripts/mainPage.js")) {
        addToHandle("/scripts/mainPage.js", function(response){requestHandlers.staticFile("./Scripts/mainPage.js","text/javascript",response);});
    }
    
    if(!isHandle("/scripts/canvasDraw.js")) {
        addToHandle("/scripts/canvasDraw.js", function(response){requestHandlers.staticFile("./Scripts/canvasDraw.js","text/javascript",response);});
    }
    
    if(!isHandle("/scripts/ajax.js")) {
        addToHandle("/scripts/ajax.js", function(response){requestHandlers.staticFile("./Scripts/ajax.js","text/javascript",response);});
    }
    
    if(!isHandle("/scripts/randomBackground.js")) {
        addToHandle("/scripts/randomBackground.js", function(response){requestHandlers.staticFile("./Scripts/randomBackground.js","text/javascript",response);});
    }
    
    if(!isHandle("/styles/canvasDraw.css")) {
        addToHandle("/styles/canvasDraw.css", function(response){requestHandlers.staticFile("./CSS/canvasDraw.css","text/css",response);});
    }
    
    if(!isHandle("/styles/MainPage.css")) {
        addToHandle("/styles/MainPage.css", function(response){requestHandlers.staticFile("./CSS/MainPage.css","text/css",response);});
    }
    
    if(!isHandle("/saved/styles/canvasDraw.css")) {
        addToHandle("/saved/styles/canvasDraw.css", function(response){requestHandlers.staticFile("./CSS/canvasDraw.css","text/css",response);});
    }

})();

server.start(router.route, handle);
intialized = true;

function addToHandle(key, funcRoute)
{
    handle[key] = funcRoute;
    
}

function isHandle(pathToCheck)
{
    util.log("check path:" + pathToCheck);
    return(typeof handle[pathToCheck] === 'function');
}


exports.isHandle = isHandle;
exports.addToHandle = addToHandle;