let path = require('path');
let tri = require('tripartite')
const tripartiteRender = require('../templating/tripartite-request-scoped-renderer')
const simpleDataFunctions = require('../templating/add-simple-template-data-functions')

function initializeTripartite(webhandle) {
	webhandle.tripartite = tri
	// Configure the requests to use tripartite templating
	tripartiteRender(webhandle)
	
	// Configure views and pages to act as template directories	
	webhandle.addTemplateDir(path.join(webhandle.projectRoot, 'views'))
	webhandle.addTemplateDir(path.join(webhandle.projectRoot, 'pages'))
	
	// Assume they are pug templates unless otherwise told
	webhandle.app.set('view engine', 'pug');

	// server content out of the "public" directory
	webhandle.addStaticDir(path.join(webhandle.projectRoot, 'public'))
	
				
	simpleDataFunctions(tri, webhandle)
}

module.exports = initializeTripartite