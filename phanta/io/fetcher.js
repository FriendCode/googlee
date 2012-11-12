// Includes
var mutils = require('../utils/utils');
var proxyMethod = mutils.proxyMethod;

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

    // page options
    this.userAgent = options.userAgent || DEFAULT_USER_AGENT;
    this.loadImages = options.loadImages || false;
    this.loadPlugins = options.loadPlugins || false;
    this.debug = options.debug || false;

    // Extra options
    this.checkTimeout = options.checkTimeout || 100;

    // Resource counts
    this.resourcesStatus = [];

    // Setup the page
    this.buildPage();
}

Fetcher.prototype.buildPage = function () {
    this.page = new WebPage();

    // Setup Proxy
    if(this.proxy)
    {
        this.page.setProxyType(this.proxy_type);
        this.page.setProxy(this.proxy);
        if(this.proxy_auth)
        {
            this.page.setProxyAuth(this.proxy_auth);
        }
        this.page.applyProxy();
    }

    var that = this;


    // Bind resource methods
    this.page.onResourceRequested = proxyMethod(this, this.pageOnResourceRequested);
    this.page.onResourceReceived = proxyMethod(this, this.pageOnResourceReceived);

    // Debugging aids
    if(this.debug) {
        this.page.onConsoleMessage = proxyMethod(this, this.pageOnConsoleMessage);
        this.page.onError = proxyMethod(this, this.pageOnError);
    }

    // To do with loading ...
    this.page.settings.userAgent = this.userAgent;
    this.page.settings.loadImages = this.loadImages;
    this.page.settings.loadPlugins = this.loadPlugins;

};



Fetcher.prototype.pageOnConsoleMessage = function(msg) {
    console.log('[PageDebug] :', msg);
};

Fetcher.prototype.pageOnError = function(msg, trace) {
    var msgStack = ['[PageError] : ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};

Fetcher.prototype.pageOnResourceRequested = function(resource) {
    this.resourcesStatus[resource.id] = false;
};

Fetcher.prototype.pageOnResourceReceived = function(resource) {
    if(resource.stage != 'end' || this.resourcesStatus[resource.id]) {
        return;
    }
    // else
    this.resourcesStatus[resource.id] = true;

    this.checkLoaded();
};

Fetcher.prototype.hasLoadedResources = function() {
    return this.resourcesStatus.every(Boolean);
};

Fetcher.prototype.requestedResourceCount = function() {
    return this.resourcesStatus.length;
};

Fetcher.prototype.receivedResourceCount = function() {
    return this.resourcesStatus.filter(Boolean).length;
};

Fetcher.prototype.checkLoaded = function() {
    if(!this.hasLoadedResources()) return;

    var that = this;

    var receivedCount = this.receivedResourceCount();
    var requestedCount = this.requestedResourceCount();

    setTimeout(function() {
        var nowReceived = that.receivedResourceCount();
        var nowRequested = that.requestedResourceCount();

        if(that.hasLoadedResources() &&
            receivedCount == nowReceived &&
            requestedCount == nowRequested
        ) {
            that.onResourcesLoaded();
        }
    }, 100);
};

Fetcher.prototype.onResourcesLoaded = function(count) {
    this.callback(this.status, this.page);
};

Fetcher.prototype.fetch = function(url, callback) {
    var that = this;
    this.url = url || this.url;
    this.callback = callback || function() {};

    // Call callabck only when all resources are loaded

    this.page.open(this.url, function(status) {
        that.status = status;

        // Failed so call callback right away
        if(status != 'success') {
            that.callback(status, that.page);
            return;
        }

        // Wait for onResourcesLoaded
    });
};


// Exports
exports.Fetcher = Fetcher;
