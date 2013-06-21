// Requires
var Fetcher = require('./fetcher').Fetcher;


function fetcher() {
    var _fetcher = new Fetcher();

    return function(req, res, next) {
        req.fetcher = _fetcher;
        return next();
    };
}

// Exports
exports.fetcher = fetcher;