let profiles = require('./lib/profiles')
let filog = require('filter-log')
let commingle = require('commingle')
let FileSink = require('file-sink')

var express = require('express');


const EventEmitter = require('events');


const addTemplateDir = require('./lib/methods/add-template-directory')
const addStaticDir = require('./lib/methods/add-static-directory')

let routers = {
	preParmParse: express.Router(),
	requestParse: express.Router(),
	preStatic: express.Router(),
	staticServers: express.Router(),
	primary: express.Router(),
	pageServer: null,
	postPages: express.Router(),
	notFound: express.Router(),
	errorHandlers: express.Router(),
	cleanup: express.Router()
}


let log = filog('webhandle')

let creator = function(options) {

	let webhandle = {
		/* the express app */
		app: null,

		profile: profiles.SIMPLE,

		/* a list of directories which contain views */
		views: [],

		/* functions which load templates */
		templateLoaders: [],

		/* a list of directories which contain static files to server */
		staticPaths: [],
		
		/* the servers of files */
		staticServers: [],
		
		/* FileSink objects which allow access to static resources */
		sinks: {},
		
		/* services created to access and process data */
		services: {},
		
		/* handlers for user requests */
		routers: routers,
		
		/* the normal sort of place where you'd add your own code */
		router: routers.primary,
		
		/* the absolute path of the project */
		projectRoot: null,
		
		/* named routers */
		routerPreStatic: routers.preStatic,
		routerPreParmParse: routers.preParmParse,
		
		/* a counter let you know when caches should be invalidated */
		resourceVersion: new Date().getTime(),
		
		/* event emitters for communications between decoupled components */
		events: {
			global: new EventEmitter()
		},

		/* code to be run after the profile setup is complete but before the environment
		 * is ready. This would be things like database connection and setup, acquiring 
		 * licenses, registering existance, ect.
		 */
		deferredInitializers: [],
		
		defaultLogLevel: filog.levels.INFO,
		
		defaultLogFilter: null,
		
		addTemplateDir: addTemplateDir,

		addStaticDir: addStaticDir,
		
		[profiles.SIMPLE + "init"]: require('./lib/profiles/simple'),
		
		init: function(app, callback) {
			this.app = app
			app.webhandle = app.wh = this

			
			// provide a sink for the location of this app
			this.sinks.project = new FileSink(this.projectRoot)
			
			let initMethod = this.profile + 'init'
			if(this[initMethod]) {
				this[initMethod]()
			}
			else {
				throw new Error('Missing profile: ' + this.profile)
			}
			
			commingle(this.deferredInitializers)(this, {}, () => {
				if(typeof callback === 'function') {
					callback(null, webhandle)
				}
			})
		}
	}
	
	return webhandle
}

module.exports = creator