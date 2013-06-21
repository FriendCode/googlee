// Requires
var restify = require('restify');

var setupRoutes = require('./routes').setupRoutes;

var middleware = require('./middleware');


function createServer() {
    var server = restify.createServer();

    // Middleware
    server.use(middleware.fetcher());

    // Parse QueryString
    server.use(restify.queryParser());

    //server.use(restify.jsonp());

    // Setup routes
    setupRoutes(server);

    return server;
}

// Exports
exports.createServer = createServer;
