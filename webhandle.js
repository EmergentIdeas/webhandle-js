let profiles = require('./lib/profiles')
let filog = require('filter-log')
let serveStatic = require('serve-static')
let commingle = require('commingle')
let _ = require('underscore')
let fs = require('fs')
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

var express = require('express');
var router = express.Router();

var pageServer = require('webhandle-page-server')

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


filog.defineProcessor('standard', {}, process.stdout, logFilter)
let log = filog('webhandle')


let webhandle = {
	profile: profiles.SIMPLE,
	views: [],
	templateLoaders: [],
	pagePaths: [],
	pageServers: [],
	staticPaths: [],
	staticServers: [],
	router: router,
	projectRoot: null,
	
	init: function(app) {
		if(this.profile == profiles.SIMPLE) {
			
			app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({
			    extended: false
			}));
			app.use(cookieParser());
			
						
			app.set('view engine', 'jade');
			
			addRequestLogging(app)
			require('./lib/templating/tripartite-request-scoped-renderer') (app, this)
			this.initStaticServers(app)
			
			app.use(this.router)
			
			
			this.initPageServers(app)
			
			// catch 404 and forward to error handler
			app.use(function(req, res, next) {
			    let err = new Error('Not Found');
			    err.status = 404;
			    next(err);
			});
			
		}
		
	},
	
	addTemplateDir: function(path) {
		this.views.push(path)
		this.templateLoaders.push(function(name, callback) {
			fs.readFile(path + '/' + name + '.tri', function(err, buffer) {
				if(!err) {
					callback(buffer.toString())
				}
				else {
					callback(null)
				}
			})
		})
	},
	
	addStaticDir: function(path) {
		this.staticPaths.push(path)
		this.staticServers.push(serveStatic(path))
	},
	
	addPageDir: function(path) {
		this.pagePaths.push(path)
		this.pageServers.push(pageServer(path))
	},
	
	initStaticServers: function(app) {
		app.use(function(req, res, next) {
			commingle([...webhandle.staticServers])(req, res, () => {
				next()
			})
		});
	},
	
	initPageServers: function(app) {
		app.use(function(req, res, next) {
			commingle([...webhandle.pageServers])(req, res, () => {
				next()
			})
		});
	}

}





module.exports = webhandle