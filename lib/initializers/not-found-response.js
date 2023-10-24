
function notFoundResponse(webhandle) {

    // error handler
    webhandle.routers.cleanup.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
		
		if(err.status == 404) {
			// render the error page
	        res.status(err.status);
	        res.render('not-found');
		}
		else {
			// render the error page
	        res.status(err.status || 500);
	        res.render('error');
		}
    })
}

module.exports = notFoundResponse