// Includes

// Constructor
function BaseView() {
	this.content_type = 'text/html';
} 

// Methods
BaseView.prototype.dispatch = function(request, response) {
	this.request = request;
	this.response = response;
	var method = request.method.toLowerCase();
	console.log(request.method + " : " + request.url)
	func = this[method];
	if(!func)
	{
		throw new Error("UnSupported HTTP Method : "+request.method+".");
	}
	// Good now
	response.headers = {'Content-Type' : this.content_type};
	return func.call(this, request, response);
};

BaseView.prototype.get = function(request, response) {
	response.write('');
	response.close();
}

BaseView.prototype.post = function(request, response) {
	this.get(request, response);
}

BaseView.prototype.head = function(request, response) {
	this.get(request, response);
}

// Exports
exports.BaseView = BaseView