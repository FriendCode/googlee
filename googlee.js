// Includes
var mserver =  require('./phanta/server/server');
var mviews = require('./phanta/views/base');
var mfetcher = require('./phanta/io/fetcher');

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
        checkTimeout: 50
    });
    fetcher.fetch(url, function(status, page) {
        if(status != 'success') {
            throw Error('Failed to load page : "'+url+'"');
        }

        var getHtml = function() {
            return page.evaluate(function() {
                return document.documentElement.outerHTML;
            });
        };

        var renderHtml = function() {
            var html = getHtml();

            // Write the content
            response.write(html);
            response.close();
        };

        // Render response to client
        renderHtml();
    });
}

// Routing
var url_map = {
    "^/" : GoogleeView
};

// Run server
var s = new mserver.Server(7201, url_map);
s.run();
