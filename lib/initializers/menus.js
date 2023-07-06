let path = require('path');
const menuLoader = require('webhandle-menus-1')
function initWebhandleMenus(webhandle) {
	// Add code for webhandle menus
	webhandle.addTemplateDir(path.join(menuLoader.__dirname, 'views'))
	webhandle.pageServer.preRun.push(menuLoader(path.join(webhandle.projectRoot, 'menus')))

}

module.exports = initWebhandleMenus