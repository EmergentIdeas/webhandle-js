

function initializeErrorHandlingAndCleanup(webhandle) {
	let app = webhandle.app
	
	/*
	 * There's a bit of a dance here. We want to define a router which has all the error
	 * handlers and will get no matter where in our previous stack of routers the 
	 * error was thrown. However, will requests will trickle down the tree of routers and
	 * handlers, errors will not.
	 * 
	 * So, what we've got to is place an error handler on the app/top-level router. We handle
	 * that error by setting it in the response. The request continues to walk through the router
	 * tree. Problem is, now it's a request, not an error.
	 * 
	 * To get the error handlers involved we have to rethrow that error once we're in a handler
	 * which is attached to the error handler router.
	 */
	

	// Set up the re-thrower for the error handler and cleanup routers.
	let rethrower = function(req, res, next) {
		if(res.rethrowError) {
			next(res.rethrowError)
		}
		else {
			next()
		}
	}

	webhandle.routers.errorHandlers.use(rethrower)
	webhandle.routers.cleanup.use(rethrower)


	// capture an error and turn it back into a request
	let errorCapture = function(err, req, res, next) {
		if(err) {
			res.rethrowError = err
		}
		next()
	}

	// the app level error handler which catches the error from all the previous levels
	app.use(errorCapture)
	
	app.use(webhandle.routers.errorHandlers)
	
	// okay, but maybe the error handlers threw errors or didn't handle them.
	// once last chance in cleanup, so we'll do another error capture
	app.use(errorCapture)
	
	app.use(webhandle.routers.cleanup)
	

}

module.exports = initializeErrorHandlingAndCleanup