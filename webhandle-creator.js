let profiles = require('./lib/profiles')
let filog = require('filter-log')
let serveStatic = require('serve-static')
let commingle = require('commingle')
let _ = require('underscore')
let fs = require('fs')
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let path = require('path');
let tri = require('tripartite')
let FileSink = require('file-sink')

var express = require('express');
var multer = require('multer')
var upload = multer({
	dest: process.env.fileUploadDest
})

let redirectPreprocessor = require('./lib/conventions/redirect-preprocessing.js')
let trackerCookie = require('tracker-cookie')
let trackerFlash = require('tracker-flash-message')

const EventEmitter = require('events');

let routers = {
	preStatic: express.Router(),
	preParmParse: express.Router(),
	primary: express.Router(),
	postPages: express.Router(),
	errorHandlers: express.Router(),
	cleanup: express.Router()
}

const pageServer = require('webhandle-page-server')
const menuLoader = require('webhandle-menus-1')

let logFilter = function(entry) {
	return entry.level && entry.level >= filog.levels.INFO
}

let addRequestLogging = function(app) {
	app.use(function(req, res, next) {
		let rl = _.extend({}, req)
		delete rl.client
		delete rl.next
		delete rl.connection
		delete rl.res
		delete rl.socket
		delete rl._events
		
	    log.debug(rl)
	    next()
	});
}


let log = filog('webhandle')

let creator = function() {

	let webhandle = {
		profile: profiles.SIMPLE,
		views: [],
		templateLoaders: [],
		staticPaths: [],
		staticServers: [],
		sinks: {},
		services: {},
		routers: routers,
		router: routers.primary,
		projectRoot: null,
		routerPreStatic: routers.preStatic,
		routerPreParmParse: routers.preParmParse,
		resourceVersion: new Date().getTime(),
		deferredInitializers: [],
		events: {
			global: new EventEmitter()
		},
		
		
		init: function(app, callback) {
			if(this.profile == profiles.SIMPLE) {
				
				this.sinks.project = new FileSink(this.projectRoot)
				
				filog.defineProcessor('standard', {}, process.stdout, logFilter)
				app.use(this.routers.preParmParse)
				
				this.routers.preParmParse.use(redirectPreprocessor)
				
				
				app.use(bodyParser.json({
					limit: process.env.maxUploadSize || '5mb'
				}))
				app.use(bodyParser.urlencoded({
					limit: process.env.maxUploadSize || '5mb',
				    extended: false
				}));
				app.use(upload.any())
				app.use(cookieParser())
				if(process.env.trackerSecretKey) {
					app.use(trackerCookie(process.env.trackerSecretKey))
					app.use(trackerFlash())
					app.use((req, res, next) => {
						req.getFlashMessages((messages) => {
							res.locals.flashMessages = messages
							next()
						})
					})
				}
				
				app.use(this.routers.preStatic)
				
				
				this.routers.preStatic.use((req, res, next) => {
					try {
						let langHeader = req.query['Accept-Language'] || req.get('Accept-Language')
						if(langHeader) {
							res.languages = langHeader.split(',').map(lang => {
								return lang.split(';')[0]
							}).map(lang => lang.toLowerCase()).filter(lang => !lang.includes('..')).filter(lang => !lang.includes('!')).filter(lang => !lang.includes('/')).filter(lang => !lang.includes('__'))
						}
					}
					catch(ex) {log.error(ex)}
					next()
				})

				this.addTemplateDir(path.join(this.projectRoot, 'views'))
			    this.addTemplateDir(path.join(this.projectRoot, 'pages'))

			    this.addStaticDir(path.join(this.projectRoot, 'public'))
				
							
				app.set('view engine', 'pug');
				
				addRequestLogging(app)
				require('./lib/templating/tripartite-request-scoped-renderer') (app, this)
				require('./lib/templating/add-simple-template-data-functions') (tri, this)
				
				this.initStaticServers(app)
				
				app.use(this.routers.primary)
				
				this.pageServer = pageServer(path.join(this.projectRoot, 'pages'))
			    app.use(this.pageServer)
				
				app.use(this.routers.postPages)
				
				// Add code for webhandle menus
				this.addTemplateDir(path.join(menuLoader.__dirname, 'views'))
				this.pageServer.preRun.push(menuLoader(path.join(this.projectRoot, 'menus')))
				
				let mongoDbLoader = require('mongo-db-loader/process-db-info')
				
				this.deferredInitializers.push((wh, blank, next) => {
					webhandle.dbs = webhandle.dbs || {}
					mongoDbLoader(webhandle.dbs, process.env.dbs, () => {
						next()
					})
				})

				this.routers.errorHandlers.use(function(req, res, next) {
					if(res.rethrowError) {
						next(res.rethrowError)
					}
					else {
						next()
					}
				})
				this.routers.cleanup.use(function(req, res, next) {
					if(res.rethrowError) {
						next(res.rethrowError)
					}
					else {
						next()
					}
				})

				app.use(function(req, res, next) {
				    let err = new Error('Not Found');
				    err.status = 404;
				    next(err);
				});
				
				app.use(function(err, req, res, next) {
					if(err) {
						res.rethrowError = err
					}
					next()
				})
				app.use(this.routers.errorHandlers)
				
				app.use(function(err, req, res, next) {
					if(err) {
						res.rethrowError = err
					}
					next()
				})
				
				app.use(this.routers.cleanup)
				
				// catch 404 and forward to error handler
			}
			
			
			commingle(this.deferredInitializers)(this, {}, () => {
				if(typeof callback === 'function') {
					callback(null, webhandle)
				}
			})
			
		},
		
		addTemplateDir: function(path, options) {
			let templateCache
			if(options && options.immutable) {
				templateCache = {}
			}
			
			this.views.push(path)
			this.templateLoaders.push(function(name, callback) {
				if(templateCache && name in templateCache) {
					callback(templateCache[name])
				}
				fs.readFile(path + '/' + name + '.tri', function(err, buffer) {
					if(!err) {
						let content = buffer.toString()
						if(templateCache) {
							templateCache[name] = content
						}
						callback(content)
					}
					else {
						fs.readFile(path + '/' + name + '.html', function(err, buffer) {
							if(!err) {
								let content = buffer.toString()
								if(templateCache) {
									templateCache[name] = content
								}
								callback(content)
							}
							else {
								if(templateCache) {
									templateCache[name] = null
								}
								callback(null)
							}
						})
					}
				})
			})
		},
		
		/**
		 * Adds a directory to be served as static content.
		 * @param {string} path The directory to be served
		 * @param {object} [options]
		 * @param {string} [options.urlPrefix] A prefix the url must have to access the content
		 * in the directory. So if the path is /foo which contains a file bar.txt and the urlPrefix
		 * is /baz then the url /baz/bar.txt will access the file.
		 */
		addStaticDir: function(path, {urlPrefix} = {}) {
			if(!urlPrefix) {
				this.staticPaths.push(path)
				this.staticServers.push(serveStatic(path))
			}
			else {
				let router = express.Router()
				router.use(urlPrefix, serveStatic(path))
				this.staticServers.push(router)
			}
		},
		
		initStaticServers: function(app) {
			app.use(function(req, res, next) {
				commingle([...webhandle.staticServers])(req, res, () => {
					next()
				})
			});
		}

	}
	
	return webhandle
}

module.exports = creator