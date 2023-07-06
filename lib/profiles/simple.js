const initializeTripartite = require('./lib/initializers/tripartite-templates')
const initializePreParm = require('./lib/initializers/pre-parm-parse')
const initializeRequestParse = require('./lib/initializers/request-parse')
const initializeLanguageHeaders = require('./lib/initializers/language-headers')
const initializeRequestLogging = require('./lib/initializers/request-logging')
const initializeWebhandleMenus = require('./lib/initializers/menus')
const initializeStaticServers = require('./lib/initializers/static-servers')
const initializeErrorHandlingAndCleanup = require('./lib/initializers/error-handling-and-cleanup')
const initializeNotFound = require('./lib/initializers/not-found')

const pageServer = require('webhandle-page-server')

function simpleInit() {

	// send all messages at info or above to std out
	if (!this.defaultLogFilter) {
		this.defaultLogFilter = (entry) => {
			return entry.level && entry.level >= webhandle.defaultLogLevel
		}
	}
	filog.defineProcessor('standard', {}, process.stdout, (entry) => {
		return webhandle.defaultLogFilter(entry)
	})

	app.use(this.routers.preParmParse)
	app.use(this.routers.requestParse)

	// We've got a request ready now. The normal first thing to do is to see if there's
	// any static resources which match our URL. However, sometimes will want to preempt 
	// access to that static content, modify the url based on language or location, or do
	// some other task which needs to be done before the static file servers get a crack.
	app.use(this.routers.preStatic)

	// Set up a handler which will will call all the static severs
	// This will use the static servers for each request, so later
	// additions of static severs will always be called as well
	app.use(this.routers.staticServers)

	// Add the primary router. This is for all the normal application code and for any
	// code which would like to populate data for rendering onto a templated paged which
	// matches the request url
	app.use(this.routers.primary)

	this.pageServer = pageServer(path.join(this.projectRoot, 'pages'))
	app.use(this.pageServer)

	app.use(this.routers.postPages)

	// a last chance to handle things when nothing else has
	app.use(this.routers.notFound)


	initializeTripartite(this)

	// Set up routes where we're doing redirects or rewrites of the url before we
	// reall start processing the request
	initializePreParm(this)

	// Setup basic housekeeping where we parse the body, handle file uploads, etc and get those
	// into the request object
	initializeRequestParse(this)

	// list out the preferred languages supplied either by HTTP header or query parameter
	initializeLanguageHeaders(this.routers.preStatic)

	// log all requests at the debug level				
	initializeRequestLogging(this.routers.preStatic)

	initializeStaticServers(this)

	// Load info from the menus to be available for the pages
	initializeWebhandleMenus(this)

	// throw a 404 error if nobody else has done anything
	initializeNotFound(this)

	// for catching errors
	initializeErrorHandlingAndCleanup(this)
	

	let mongoDbLoader = require('mongo-db-loader/process-db-info')

	this.deferredInitializers.push((wh, blank, next) => {
		webhandle.dbs = webhandle.dbs || {}
		mongoDbLoader(webhandle.dbs, process.env.dbs, () => {
			next()
		})
	})


}
modules.export = simpleInit