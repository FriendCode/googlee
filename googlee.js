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
    var fetcher = new mfetcher.Fetcher();
    fetcher.fetch(url, function(status, page) {
        if(status != 'success') {
            console.log('Error fetching page');
            response.write('ERROR');
            response.close();
        }
        
        // Write the content
        response.write(page.content);
        response.close();
    });
}

// Routing
var url_map = {
    "^/" : GoogleeView
};

// Run server
var s = new mserver.Server(7201, url_map);
s.run();
