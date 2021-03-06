let express = require('express');
let path = require('path');
const fs = require('fs')

module.exports = function(projectRoot, callback) {

    let app = express()
    let wh = require('./webhandle')
	app.wh = wh
    wh.projectRoot = projectRoot

    wh.init(app, () => {
		require.main.require('./server-js/add-routes')(wh.router)
		if(callback) {
			callback(null, wh)
		}
	})

    // error handler
    wh.routers.cleanup.use(function(err, req, res, next) {
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

    });
    return app
}