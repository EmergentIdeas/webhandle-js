let path = require('path');
let tri = require('tripartite')

function initializeTripartite(webhandle) {
	webhandle.tripartite = tri
	
	// Configure views and pages to act as template directories	
	webhandle.addTemplateDir(path.join(webhandle.projectRoot, 'views'))
	webhandle.addTemplateDir(path.join(webhandle.projectRoot, 'pages'))
	
	// Assume they are pug templates unless otherwise told
	app.set('view engine', 'pug');

	// server content out of the "public" directory
	webhandle.addStaticDir(path.join(webhandle.projectRoot, 'public'))
	
				
	// Configure the requests to use tripartite templating
	require('../templating/tripartite-request-scoped-renderer') (webhandle.app, webhandle)
	require('../templating/add-simple-template-data-functions') (tri, webhandle)
	

}

module.exports = initializeTripartite