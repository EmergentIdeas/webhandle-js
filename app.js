let express = require('express');

module.exports = function(projectRoot, callback) {

    let app = express()
    let wh = require('./webhandle')
	app.wh = wh
    wh.projectRoot = projectRoot

    wh.init(app, () => {
		if(typeof require !== 'undefined' && require.main && require.main.require)
		require.main.require('./server-js/add-routes')(wh.router)
		if(callback) {
			callback(null, wh)
		}
	})

    return app
}