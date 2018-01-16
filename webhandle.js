let profiles = require('./lib/profiles')
let filog = require('filter-log')
let serveStatic = require('serve-static')
let commingle = require('commingle')
let _ = require('underscore')
let fs = require('fs')
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let path = require('path');

var express = require('express');
var router = express.Router();
var multer = require('multer')
var upload = multer()



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


let webhandle = {
	profile: profiles.SIMPLE,
	views: [],
	templateLoaders: [],
	staticPaths: [],
	staticServers: [],
	router: router,
	projectRoot: null,
	
	init: function(app) {
		if(this.profile == profiles.SIMPLE) {
			filog.defineProcessor('standard', {}, process.stdout, logFilter)
			
			app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({
			    extended: false
			}));
			app.use(upload.any())
			app.use(cookieParser())

			this.addTemplateDir(path.join(this.projectRoot, 'views'))
		    this.addTemplateDir(path.join(this.projectRoot, 'pages'))

		    this.addStaticDir(path.join(this.projectRoot, 'public'))
			
						
			app.set('view engine', 'jade');
			
			addRequestLogging(app)
			require('./lib/templating/tripartite-request-scoped-renderer') (app, this)
			this.initStaticServers(app)
			
			app.use(this.router)
			
			this.pageServer = pageServer(path.join(this.projectRoot, 'pages'))
		    app.use(this.pageServer)
			
			// Add code for webhandle menus
			this.addTemplateDir(path.join(menuLoader.__dirname, 'views'))
			this.pageServer.preRun.push(menuLoader(path.join(this.projectRoot, 'menus')))
			
			
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
	
	initStaticServers: function(app) {
		app.use(function(req, res, next) {
			commingle([...webhandle.staticServers])(req, res, () => {
				next()
			})
		});
	}

}





module.exports = webhandle
