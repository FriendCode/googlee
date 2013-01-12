// Includes
var mserver =  require('./phanta/server/server');
var mviews = require('./phanta/views/base');
var mfetcher = require('./phanta/io/fetcher');
var MetaExtractor = require('./lib/metainfo').MetaExtractor;


// Handle errors with http responses
function handleError(statusCode, msg, response) {
    response.statusCode = statusCode;
    response.write(msg);
    response.close();
}

// Constructor
function GoogleeView(request, response) {
    var url = request.GET.url;
    var timeout = request.GET.t;

    // Validate input
    if(!url) {
        throw Error('Requires url parameter');
    }

    // Fetch
    var fetcher = new mfetcher.Fetcher({
        checkTimeout: 100,
        userAgent: 'Googlee'
    });
    fetcher.fetch(url, function(err, fetchedResponse) {
        // Couldn't open page ...
        if(err) {
            return handleError(404, 'Failed to load page : "'+url+'". ' + String(err), response);
        }

        // Build meta extractor
        var page = fetchedResponse.page;
        var meta = new MetaExtractor(page);

        // Handle HTTP error triggered by Javascript client
        if(meta.hasHttpErrors()) {

            var httpError = meta.getMainHttpError();
            return handleError(httpError.code, httpError.msg, response);
        }

        // Seems to be normal, render response to client
        var html = fetchedResponse.getHtml();
        response.write(html);
        response.close();
        fetchedResponse.close();
    });
}

// Routing
var url_map = {
    "^/" : GoogleeView
};

// Run server
var s = new mserver.Server(7201, url_map);
s.run();
