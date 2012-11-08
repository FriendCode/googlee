// Includes
var mutils = require('../utils/utils');

// Consts
//var DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20";
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11";


// Constructor
function Fetcher(url, proxy, proxy_auth, proxy_type, preserve_page) {
    this.proxy = proxy;
    this.proxy_auth = proxy_auth;
    this.proxy_type = proxy_type ? proxy_type : 'http';
    this.url= url;
    // Preserve page through requests
    this.preserve_page = preserve_page ? preserve_page : false;
}

Fetcher.prototype.buildPage = function () {
    this.page = this.page && this.preserve_page ? this.page : new WebPage();

    // Change User-Agent
    this.page.settings.userAgent = DEFAULT_USER_AGENT;


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


    this.resourcesRequested = 0;
    this.resourcesReceived = 0;
    this.page.onResourceRequested = function(request) {
        that.resourcesRequested += 1;
    };

    this.page.onResourceReceived = function(response) {
        that.resourcesReceived += 1;
        if(that.hasLoadedResources()) {
            var resourceCount = that.resourcesReceived;

            // Delay a check to make sure
            var callLater = (function(count) {
                return function() {
                    if(that.hasLoadedResources() && that.resourcesReceived == resourceCount) {
                        that.onResourcesLoaded(count);
                    }
                };
            })(resourceCount);

            setTimeout(callLater, 50);
        }
    };

    this.page.settings.userAgent = 'googlebot';
    this.page.settings.loadImages = false;
    this.page.settings.loadPlugins = true;

    this.page.onConsoleMessage = function(msg) {
        console.log('[Page]', "'"+msg+"'");
    };
};

Fetcher.prototype.hasLoadedResources = function() {
    return this.resourcesRequested == this.resourcesReceived;
};


Fetcher.prototype.onResourcesLoaded = function(count) {
    console.log('Loaded ' + count + ' resources');
};

Fetcher.prototype.fetch = function(url, _callback) {
    this.url = url ? url : this.url;
    var that = this;
    var callback = _callback || function() {};
    var toCall =  function(status) {
        that.onFetch.call(that, status);
        callback(status, that.page);
    };

    this.buildPage();
    this.page.open(this.url, toCall);
};

Fetcher.prototype.onFetch = function(status) {
    // Inherit to customize
};


// Exports
exports.Fetcher = Fetcher;
