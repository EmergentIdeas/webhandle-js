let path = require('path');

let filog = require('filter-log')
let log = filog('webhandle')

let tri = require('tripartite')

let _ = require('underscore')

module.exports = function(app, options) {
	app.use(function(req, res, next) {
		let reqTri = tri.createBlank()
		reqTri.loaders = options.templateLoaders
		
		let oldRender = res.render
		res.render = function(name, data) {
			reqTri.loadTemplate(name, function(template) {
				if(template) {
					data = data || res.locals
					template(data, res, function() {
						res.end()
					})
				}
				else {
					next()
				}
			})
		}
		next()
	})
}	