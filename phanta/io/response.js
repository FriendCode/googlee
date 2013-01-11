// Includes
var mutils = require('../utils/utils');
var stringRepeat = mutils.stringRepeat;
var proxyMethod = mutils.proxyMethod;


// Constructor
function FetcherResponse(options) {
    options = options || {};
    this.url = options.url;
    this.page = options.page;
    this.callback = options.callback;
    this.debug = options.debug;

    // Extra options
    this.checkTimeout = options.checkTimeout || 100;

    if(!this.url || !this.page || !this.callback) {
        throw Error("FetcherResponse wasn't given the necessary arguments");
    }


    // Resource counts
    this.resourcesStatus = [];

    this.hasAnswered = false;

    // VERY important
    this.setupHandlers();
}

FetcherResponse.prototype.setupHandlers = function () {
    // Bind resource methods
    this.page.onResourceRequested = proxyMethod(this, this.pageOnResourceRequested);
    this.page.onResourceReceived = proxyMethod(this, this.pageOnResourceReceived);

    // Debugging aids
    if(this.debug) {
        this.page.onConsoleMessage = proxyMethod(this, this.pageOnConsoleMessage);
        this.page.onError = proxyMethod(this, this.pageOnError);
    }
};



FetcherResponse.prototype.pageOnConsoleMessage = function(msg) {
    console.log('[PageDebug] :', msg);
};

FetcherResponse.prototype.pageOnError = function(msg, trace) {
    var msgStack = ['[PageError] : ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};

FetcherResponse.prototype.pageOnResourceRequested = function(resource) {
    this.resourcesStatus[resource.id] = false;
};

FetcherResponse.prototype.pageOnResourceReceived = function(resource) {
    if(resource.stage != 'end' || this.resourcesStatus[resource.id]) {
        return;
    }

    // else
    this.resourcesStatus[resource.id] = true;

    this.checkLoaded();
};

FetcherResponse.prototype.hasLoadedResources = function() {
    if(this.hasAnswered) {
        console.log('Already responded !!!');
    }
    return this.resourcesStatus.every(Boolean) && !this.hasAnswered;
};

FetcherResponse.prototype.requestedResourceCount = function() {
    return this.resourcesStatus.length;
};

FetcherResponse.prototype.receivedResourceCount = function() {
    return this.resourcesStatus.filter(Boolean).length;
};

FetcherResponse.prototype.checkLoaded = function() {
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
    }, this.checkTimeout);
};

FetcherResponse.prototype.onResourcesLoaded = function(count) {
    this.hasAnswered = true;
    this.callback(null, this);
};

FetcherResponse.prototype.getHtml = function() {
    return this.page.evaluate(function() {
        return document.documentElement.outerHTML;
    });
};

FetcherResponse.prototype.execute = function() {
    var that = this;
    this.page.open(this.url, function(status) {
        // Failed so call callback right away
        if(status != 'success') {
            that.callback(Error('Failure opening page'), that);
            return;
        }

        // Wait for onResourcesLoaded
    });
};

// Exports
exports.FetcherResponse = FetcherResponse;
