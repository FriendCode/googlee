// Includes
var mutils = require('../utils/utils');
var stringRepeat = mutils.stringRepeat;
var proxyMethod = mutils.proxyMethod;

var FetcherResponse = require('./response').FetcherResponse;

// Consts
//var DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20";
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11";


// Constructor
function Fetcher(options) {
    options = options || {};
    this.proxy = options.proxy;
    this.proxy_auth = options.proxy_auth;
    this.proxy_type = options.proxy_type || 'http';
    this.url = options.url || '';
    this.callback = options.callback || function() {};

    // page options
    this.userAgent = options.userAgent || DEFAULT_USER_AGENT;
    this.loadImages = options.loadImages || false;
    this.loadPlugins = options.loadPlugins || false;
    this.debug = options.debug || false;
    this.viewportSize = { width: 1280, height: 800};

    // Extra options
    this.checkTimeout = options.checkTimeout || 100;
}

Fetcher.prototype.buildPage = function () {
    var page = new WebPage();

    // Setup Proxy
    if(this.proxy)
    {
        page.setProxyType(this.proxy_type);
        page.setProxy(this.proxy);
        if(this.proxy_auth)
        {
            page.setProxyAuth(this.proxy_auth);
        }
        page.applyProxy();
    }

    // To do with loading ...
    page.settings.userAgent = this.userAgent;
    page.settings.loadImages = this.loadImages;
    page.settings.loadPlugins = this.loadPlugins;
    page.viewportSize = this.viewportSize;

    return page;
};


Fetcher.prototype.fetch = function(url, callback) {
    url = url || this.url;
    callback = callback || this.callback;

    // Call callabck only when all resources are loaded
    var page = this.buildPage();

    // Our options for the fetcher
    var fetcherOptions = {
        url: url,
        page: page,
        debug: this.debug,
        checkTimeout: this.checkTimeout,
        callback: callback
    };

    // The response handles making sure all the resources are loaded
    // etc ...
    var response = new FetcherResponse(fetcherOptions);

    // Fetch page and respond
    response.execute();
};


// Exports
exports.Fetcher = Fetcher;
