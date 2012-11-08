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

        var args = {
            page: page,
            response: response
        };

        var finishedLoading = function() {
            return page.evaluate(function() {
                return document.querySelectorAll('.ui-boot').length === 0;
            });
        };

        var getHtml = function() {
            return page.evaluate(function() {
                return document.documentElement.outerHTML;
            });
        };

        var getUrl = function() {
            return page.evaluate(function() {
                return window.location.href;
            });
        };


        var renderHtml = function() {
            var html = getHtml();

            // Write the content
            response.write(html);
            response.close();
        };

        var visitHash = function(hash) {
            var hashToApply = '#!'+hash;
            var args = {
                hashToApply: hashToApply
            };
            return page.evaluate(function(args) {
                var hashToApply = args.hashToApply;
                return window.location.hash = hashToApply;
            }, args);
        };

        var hash = url.split('#!')[1];
        if(hash) {
            console.log('Visiting hash');
            visitHash(hash);
            console.log('Url ', getUrl());
            setTimeout(renderHtml, 1000);
        } else {
            var tries = 0;
            var timeoutId = setInterval(function () {
                tries += 1;

                console.log('Try #', tries);
                console.log('Url ', getUrl());

                // Keep looping (bad)
                if(!finishedLoading() && tries <= 100) {
                    return;
                }

                // End looping (good)
                window.clearInterval(timeoutId);

                setTimeout(renderHtml, 200);
            }, 50);
        }
    });
}

// Routing
var url_map = {
    "^/" : GoogleeView
};

// Run server
var s = new mserver.Server(7201, url_map);
s.run();
