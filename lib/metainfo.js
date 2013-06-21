// Requires

function MetaExtractor(page) {
    this.page = page;
}

// Get the object in the page which holds the meta info
MetaExtractor.prototype.getObj = function(page) {
    return page.evaluate("window.googlee;");
};


// Check if the current page has any meta info
MetaExtractor.prototype.hasMeta = function(page) {
    return this.getObj(page) !== undefined;
};


MetaExtractor.prototype.extract = function() {
    return this.getObj(this.page) || {};
};

// Get a specific entry from the meta data
MetaExtractor.prototype.getAttribute = function(attributeName, defaultValue) {
    return this.extract()[attributeName] || defaultValue || [];
};


MetaExtractor.prototype.getErrors = function() {
    return this.getAttribute('errors').reverse();
};

MetaExtractor.prototype.getWarnings = function() {
    return this.getAttribute('warnings').reverse();
};

MetaExtractor.prototype.getLogs = function() {
    return this.getAttribute('logs').reverse();
};

MetaExtractor.prototype.buildErrorTypeFilter = function(typeName) {
    return function(errorElement) {
        return errorElement.type == typeName;
    };
};


MetaExtractor.prototype.cleanErrorElement = function(errorElement) {
    return errorElement.data;
};

MetaExtractor.prototype.getHttpErrors = function() {
    var errors = this.getErrors().filter(
        this.buildErrorTypeFilter('http')
    );

    return errors.map(this.cleanErrorElement);
};

MetaExtractor.prototype.getJsErrors = function() {
    var errors = this.getErrors().filter(
        this.buildErrorTypeFilter('js')
    );

    return errors.map(this.cleanErrorElement);
};

MetaExtractor.prototype.hasErrors = function() {
    return this.getErrors().length > 0;
};

MetaExtractor.prototype.hasHttpErrors = function() {
    return this.getHttpErrors().length > 0;
};

MetaExtractor.prototype.hasJsErrors = function() {
    return this.getJsErrors().length > 0;
};

MetaExtractor.prototype.isOk = function() {
    return !this.hasErrors();
};

MetaExtractor.prototype._normalizeHttpError = function(httpError) {
    var err = new Error(httpError.msg);
    err.statusCode = httpError.code || httpError.statusCode || 500;
    return err;
};

MetaExtractor.prototype.getMainHttpError = function() {
    return this._normalizeHttpError(
        this.getHttpErrors()[0]
    );
};

// Exports
exports.MetaExtractor = MetaExtractor;