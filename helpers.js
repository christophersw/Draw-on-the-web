var appUrl = "http://nodeplayground.christophersw.c9.io/";
var util = require('util');

exports.appUrl = appUrl;
exports.util = util;



    // Process for making request from node...
    //   var options = {
    //    host: 'wikipedia.org',
    //    path: '/wiki/Spanish_conquest_of_Guatemala',
    //    method: 'GET'
    //    };
    //    var processRes = function(res) {
    //        var resData;
    //        var status = res.statusCode;
    //
    //        switch (status) {
    //
    //        case 301:
    //            options = {
    //                host: url.parse(res.headers.location).hostname,
    //                path: url.parse(res.headers.location).pathname,
    //                method: 'GET'
    //            };
    //
    //            req = http.get(options, processRes);
    //            req.end();
    //            break;
    //
    //        case 200:
    //            // keep track of the data you receive
    //            res.on('data', function(d) {
    //                resData += d + "\n";
    //            });
    //
    //            // finished? ok, write the data to a file
    //            res.on('end', function() {
    //                var body = '<canvas id="Canvas">No Canvas</canvas>' + '<div>' + resData + '</div>';
    //                wrappers.standard(meta, body, response);
    //            });
    //
    //            break;
    //
    //        default:
    //            var body = '<canvas id="Canvas">No Canvas</canvas>' + '<div> Not Found </div>';
    //            wrappers.standard(meta, body, response);
    //            break;
    //        }
    //
    //    };
    //
    //    var req = http.get(options, processRes);
    //
    //    req.on('error', function(e) {
    //        console.log('problem with request: ' + e.message);
    //    });
    //
    //    req.end();