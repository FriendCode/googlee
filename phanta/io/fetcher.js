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
};

Fetcher.prototype.fetch = function(url, callback) {
    this.url = url ? url : this.url;
    var that = this;
    this.buildPage();
    this.page.open(this.url, function(status) {
        if(!callback) {
            that.onFetch.call(that, status);
        }
        else {
            callback(status, that.page);
        }
    });
};

Fetcher.prototype.onFetch = function(status) {
    // Inherit to customize
};


// Exports
exports.Fetcher = Fetcher;
