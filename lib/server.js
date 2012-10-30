// Requires
var _ = require('underscore');
var express = require('express');
var fetcher = require('./fetcher');


function createServer(config) {
    var app = express();
    app.get('/', function(req, res) {
        var url = req.query.url;
        var options = _.clone(config);

        // get optional timeout
        options.timeout = req.query.timeout || options.timeout;

        // 404 if no url asked for
        if(_.isUndefined(url)) {
            return res.send(404);
        }

        console.log('FETCHING', url);
        // Get page
        fetcher.fetchPage(url, options, function(html) {
            return res.send(html);
        });
    });

    return app;
}

// Exports
module.exports.createServer = createServer;