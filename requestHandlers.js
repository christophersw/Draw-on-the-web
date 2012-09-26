"use strict";

var wrappers = require('./wrappers'),
    common = require("./Common"),
    index = require("./index"),
    fs = require('fs'),
    url = require('url'),
    util = require('util');
    var store = [];
  
(function getData(){
    fs.readFile("./Data/store.txt", function(err, content){
        if(err) throw err;
            try{
                store = JSON.parse(content);
                for(var s = 0; s < store.length; s++)
                {  
                    //a closure must be used here b/c we cannot reference ever-changing s...
                    (function(s){
                        index.addToHandle('/saved/' + s, function(response, request){draw(response, request, s) ;});
                        })(s);                    
                }
                util.log("read Store file");
            }
            catch(err)
            {
                store = [];
                util.log("could not read Store file");
            }
        });
})();
    
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

    meta.jscripts = ['/scripts/canvasDraw.js', '/scripts/ajax.js'];
    
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
            util.log("Served" + path);
        }
    });
}

function save(response, request){
    
    if ( request.method === 'POST' ) {
        // the body of the POST is JSON payload.
        var data = '';    
        store.push(data);
        var currentIndex = store.length - 1;
        
        var path = currentIndex; //at somepoint we may want to allow people to set this themselves. 
        
        index.addToHandle('/saved/' + path, function(response, request){draw(response, request,currentIndex);});
        
        response.setHeader('Content-Type', "text/plain");
        response.writeHead(200);
        response.write('<a href="'+ common.appUrl + '/saved/' + path + '">' + common.appUrl + '/saved/' + path + '</a>');
        response.end();
        util.log("served save... handle:" + path );
        
        //handle the data Async...
        request.addListener('data', function(chunk) { data += chunk; });
        request.addListener('end', function() {
        
        store[currentIndex] = JSON.parse(data);
        
        util.log("Added to store... handle:" + path );
        
        fs.writeFile("./Data/store.txt", JSON.stringify(store), function(err){
                if(err){
                    throw err;
                }
                util.log("Wrote Store file to disk");
            });
        
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