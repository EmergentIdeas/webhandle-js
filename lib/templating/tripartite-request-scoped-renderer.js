let filog = require('filter-log')
let log = filog('webhandle', { component: 'tripartite setup' })
let tri = require('tripartite')

let PausingTransform = require('pausing-transform')
let compositeStream = require('./composite-stream')

function changeRequestForTripartite(req, res, next) {
	try {
		let reqTri = res.tri = tri.createBlank()
		reqTri.loaders = webhandle.templateLoaders
		reqTri.dataFunctions = Object.assign({}, tri.dataFunctions)

		let headTransform = new PausingTransform()
		headTransform.name = 'head'
		headTransform.res = res
		res.headTransform = headTransform
		headTransform.continueOnTripartiteError = true

		let tailTransform = new PausingTransform()
		tailTransform.name = 'tail'
		tailTransform.pipe(res)

		compositeStream(headTransform, tailTransform)

		headTransform.addFilter = headTransform.addStream

		res.addFilter = headTransform.addFilter.bind(headTransform)

		res.oldRender = res.render
		res.render = function (name, data, callback) {
			reqTri.loadTemplate(name, function (template) {
				if (template) {
					data = data || res.locals
					template(data, res.headTransform, function (err) {
						if (err) {
							log.error(err)
						}
						try {
							headTransform.end()
						}
						catch (e) {
							log.error(e)
						}
						if (callback) {
							return callback()
						}
					})
				} else {
					res.oldRender(name, data, callback)
				}
			})
		}
		next()
	}
	catch (e) {
		log.error({
			error: e.message,
			line: e.lineNumber,
			col: e.columnNumber,
			stack: e.stack
		})
	}
}

function addTripartite(webhandle) {
	webhandle.app.use(changeRequestForTripartite)
}

module.exports = addTripartite