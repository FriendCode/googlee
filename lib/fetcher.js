// Requires
var Q = require('q');
var _ = require('underscore');

var Browser = require('zombie');


function Fetcher(options) {
    this.options = options || {};
}

Fetcher.prototype.fetch = function(url, options) {
    // Load the page from localhost
    //Browser.debug = true;

    // Visit page
    return Q.nfcall(Browser.visit, url, options);
};


// Exports
exports.Fetcher = Fetcher;
