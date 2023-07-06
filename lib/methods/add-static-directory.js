let serveStatic = require('serve-static')
var express = require('express');

/**
 * Adds a directory to be served as static content.
 * @param {string} path The directory to be served
 * @param {object} [options]
 * @param {string} [options.urlPrefix] A prefix the url must have to access the content
 * in the directory. So if the path is /foo which contains a file bar.txt and the urlPrefix
 * is /baz then the url /baz/bar.txt will access the file.
 */
function addStaticDir(path, {urlPrefix} = {}) {
	if(!urlPrefix) {
		this.staticPaths.push(path)
		this.staticServers.push(serveStatic(path))
	}
	else {
		let router = express.Router()
		router.use(urlPrefix, serveStatic(path))
		this.staticServers.push(router)
	}
}

module.exports = addStaticDir