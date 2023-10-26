let express = require('express');

module.exports = function(projectRoot, callback) {

    let app = express()
    let wh = require('./webhandle')
	app.wh = wh
    wh.projectRoot = projectRoot

    wh.init(app, () => {
		if(typeof require !== 'undefined' && require.main && require.main.require) {
			try {
				require.main.require('./server-js/add-routes')(wh.router)
			}
			catch(e) {
				// probably not a big deal. This will happen if we've been invoked via a module
			}
		}
		if(callback) {
			callback(null, wh)
		}
	})

    return app
}