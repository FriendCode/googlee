// Requires
var phantom = require('phantom');

var DEFAULT_TIMEOUT = 2 * 1000;


// Kind of callback hell but don't have much time :(
function fetchPage(url, options, callback) {
    options = options || {};
    var timeout = Number(options.timeout) || DEFAULT_TIMEOUT;

    // Fork a process
    console.log('here');
    phantom.create(function(ph) {
        // Open a page instance
        console.log('here2');

        return ph.createPage(function(page) {
            console.log('here3');

            // Open the actual page
            return page.open(url, function(status) {
                console.log('here4');

                // Grap html after timeout
                setTimeout(function() {
                    console.log('here5');
                    console.log(page);
                    // Return data to callback
                    callback(page.html);
                }, timeout);
            });
        });
    });
}


// Exports
module.exports.fetchPage = fetchPage;