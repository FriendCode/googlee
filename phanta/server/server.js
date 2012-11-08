// Includes
var webserver = require('webserver');
var mutils= require('../utils/utils');
var views = require('../views/base');


var DEFAULT_PORT = 8086;
var DEAULT_ERROR_MSG = 'Something went wrong, Spooky could not handle this request';
var DEFAULT_ERROR_CODE = 500;
var DEFAULT_URLMAP = {};

// Constructor
function Server(port, urlmap) {
    this._webserver = webserver.create();
    this._port = port ? port : DEFAULT_PORT;
    this._urlmap = urlmap ? urlmap : DEFAULT_URLMAP;
}

// Methods
Server.prototype.run = function() {
    this.handle_request._server = this;
    return this._webserver.listen(this._port, this.handle_request);
};

Server.prototype.error_handler = function(request, response, msg, code) {
    // Vars
    msg = msg ? msg : DEFAULT_ERROR_MSG;
    code = code ? code : DEFAULT_ERROR_CODE;
    response.statusCode = code;
    response.write('<html><body style="background:#222; color:#eee; text-align:center; font-family:arial,sans-serif;">');
    response.write('<h1 style="margin-top: 30px;">Spooky</h1><p><b>Http Error '+code+' : </b>"' + msg + '"</p>');
    response.write('</body></html>');
    response.close();
};

Server.prototype.handler_404 = function(request, response) {
    var msg = 'Counld not find a controller for : "'+ request.url +'".';
    this.error_handler(request, response, msg, 404);
};

Server.prototype.map_url = function(request, response) {
    var map = this._urlmap;
    for(var regexstr in map)
    {
        var regex = new RegExp(regexstr);
        // URL Matches regex
        if(regex.test(request.url))
        {
            // Successfuly mapped
            var view = map[regexstr];
            if(view instanceof views.BaseView)
            {
                view.dispatch(request, response);
                return true;
            }
            // else if is a simple function
            view(request, response);
            return true;
        }
    }
    // Failure
    return false;
};

Server.prototype.parse_request = function(request) {
    var query_string = mutils.parseURL(request.url).query_string;

    // Add GET
    request.GET = mutils.parseQS(query_string);

    return request;
};

Server.prototype.handle_request = function(request, response) {
    var server = Server.prototype.handle_request._server;

    // Adds info such as GET
    request = server.parse_request(request);

    var mapped = true;
    try {
        mapped = server.map_url(request, response);
    }
    catch(error) {
        server.error_handler(request, response, error);
    }

    if(!mapped)
    {
        server.handler_404(request, response);
    }
};

// Export this
exports.Server = Server;

