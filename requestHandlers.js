var wrappers = require('./wrappers'),
    common = require("./Common"),
    index = require("./index"),
    fs = require('fs'),
    url = require('url');
    var store = [];
    
function main(response) {
    var meta = {
        title: 'Draw on the Web!'
    };
    meta.css = ['styles/MainPage.css'];
    meta.jscripts = ['/scripts/mainPage.js'];

    fs.readFile("./Pages/MainForm.html", function(err, content) {
        if (err) {
            throw err;
        }
        else {
            var body = content;
            wrappers.standard(meta, body, response);
        }
    });
}

function draw(response, request, savedIndex) {
    var urlToGet;
    var storedObj;
    
    if(savedIndex === undefined){
        var query = url.parse(request.url, true).query;
        urlToGet = query.page;
        urlToGet = "http://" + urlToGet;
    }
    else{
        storedObj = store[savedIndex];
        urlToGet = storedObj.url;
    }    
    
    var meta = {
        title: 'Start'
    };

    meta.css = ['styles/canvasDraw.css'];

    meta.jscripts = ['http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.0.js', //jquery
    '/scripts/canvasDraw.js'];
    
    fs.readFile("./Pages/CanvasDraw.html", function(err, content){
        if(err){
            common.util.log(err);
            throw err;    
        }
        else{
            var body = content;
            
            //dynamic content to add to the end of the static content...
            body += '<iframe id="Iframe" sandbox="allow-forms allow-scripts" src="' + urlToGet + '"></iframe>';
            
            if(savedIndex !== undefined)
            {
                body += '<span id="saved" style="display:none" data-savedDate=' + JSON.stringify(storedObj) + '></span>';
            }
            wrappers.standard(meta, body, response);
        }
    });
}

function staticFile(path,contentType, response)
{
     fs.readFile(path, function (err, content) {
        if (err) {
            throw err;
        }
        else{
            response.setHeader('Content-Type', contentType);
            response.writeHead(200);
            response.write(content);
            response.end();
        }
    });
}

function save(response, request){
    
    if ( request.method === 'POST' ) {
        // the body of the POST is JSON payload.
        var data = '';    
        
        request.addListener('data', function(chunk) { data += chunk; });
        request.addListener('end', function() {
            store.push(JSON.parse(data));
            
            var currentIndex = store.length - 1;
            index.addToHandle('/saved/' + currentIndex, function(response, request){draw(response, request,currentIndex);});
                        
            response.setHeader('Content-Type', "text/plain");
            response.writeHead(200);
            response.write('<a href="'+ common.appUrl + '/saved/' + currentIndex + '">' + common.appUrl + '/saved/' + currentIndex + '</a>');
            response.end();
        });
    }
    else{
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write("404 Bad Post");
        response.end();
    }

}

function openSaved(response, request, key) {
    var key = url.parse(request.url).hash;
    if (key !== null && key !== "") {
        draw(response, request, key);
    }
    else {
        response.setHeader('Content-Type', "text/plain");
        response.writeHead(404);
        response.write("Not Found");
        response.end();
    }
}


exports.openSaved = openSaved;
exports.save = save;
exports.staticFile = staticFile;
exports.draw = draw;
exports.main = main;