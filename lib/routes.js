// Requires
var _ = require('underscore');

var tasks = require('./tasks/');


var ROUTES = [
    // Server Status
    ['get', '/', tasks.fetch.fetch]
];


function setupRoutes(server) {
    _.each(ROUTES, function(route) {
        var method = route[0];
        var url = route[1];
        var view = route[2];

        server[method].call(server, url, view);
    });
}

// Exports
exports.setupRoutes = setupRoutes;
