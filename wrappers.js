var async = require("./Async/lib/async");
var common = require("./Common");

function standard(meta, body, response) {
    var headerTagged = '<head>' + '<meta charset=\"utf-8\"/>' + '<title>' + meta.title + '</title>';
    
    for (var i = 0; i < meta.css.length; i++) {
    headerTagged += '<link rel="stylesheet" href="' + meta.css[i] + '" type="text/css" />';
    }

    for (i = 0; i < meta.jscripts.length; i++) {
      headerTagged += '<script src="' + meta.jscripts[i] + '" type="text/javascript"></script>';
    }
        
    headerTagged += '</head>';

    //complete the call...
    var bodyTagged = '<body id="body">' + body + '</body>';
    
    response.setHeader('Content-Type', "text/html");
    response.writeHead(200);
    response.write('<!DOCTYPE html>' + '<html>' + headerTagged + bodyTagged + '</html>');
    response.end();
}

function asyncDemo(meta, body, response) {
    var title = meta.title;

    var headerTagged = '<head>' + '<meta charset=\"utf-8\"/>' + '<title>' + title + '</title>' + '</head>';

    //whilst(test, fn, callback)
    var count = 0;
    async.whilst(

    function() {
        return count < 10;
    },

    function(callback) {
        count++;
        common.util.log(count);
        setTimeout(callback, 1000);
    },

    function(err) {
        //complete the call...
        var bodyTagged = '<body id="body">' + body + '</body>';
        response.write('<!DOCTYPE html>' + '<html>' + headerTagged + bodyTagged + '</html>');
        response.end();
    });
}

exports.standard = standard;