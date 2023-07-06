
let redirectPreprocessor = require('../conventions/redirect-preprocessing.js')

function initPreParm(webhandle) {
	
				// creates cache headers and rewrites urls for request with the format /vrsc/1234124124/...
				webhandle.routers.preParmParse.use(redirectPreprocessor)

}

module.exports = initPreParm