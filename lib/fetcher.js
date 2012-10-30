// Requires
var phantom = require('phantom');

var DEFAULT_TIMEOUT = 2 * 1000;


// Kind of callback hell but don't have much time :(
function fetchPage(url, options, callback) {
    options = options || {};
    var timeout = Number(options.timeout) || DEFAULT_TIMEOUT;

    // Fork a process
    phantom.create(function(ph) {
        // Open a page instance
        return ph.createPage(function(page) {

            // Open the actual page
            return page.open(url, function(status) {

                // Grap html after timeout
                setTimeout(function() {
                    page.evaluate(function() {
                        return document.documentElement.outerHTML;
                    }, function(html) {
                        // Return data to callback
                        callback(html);
                    });
                }, timeout);
            });
        });
    });
}


// Exports
module.exports.fetchPage = fetchPage;