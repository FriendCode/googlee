// Requires
var restify = require('restify');

var MetaExtractor = require('../metainfo').MetaExtractor;


function fetch(req, res, next) {
    var url = req.query.url;

    if(!url) {
        return next(new restify.InvalidArgumentError("Missing 'url' GET argument"));
    }

    console.log('Fetching', url);
    req.fetcher.fetch(url)
    .then(function(browser) {
        var meta = new MetaExtractor(browser);
        console.log('got', url);

        // 404, 500 or whatever triggered by the browser's JS
        if(meta.hasHttpErrors()) {
            console.log('errors', url);
            return res.send(meta.getMainHttpError());
        }

        console.log('sending', url);

        // Send response
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(browser.html());

        console.log('freeing', url);

        // Free up ressources
        browser.destroy();

        console.log('freed');
    })
    .fail(res.send)
    .done();

}

// Exports
exports.fetch = fetch;
