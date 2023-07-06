
function initializeNotFound(webhandle) {
	// catch 404 and forward to error handler
	webhandle.routers.notFound.use(function(req, res, next) {
		let err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
}

module.exports = initializeNotFound