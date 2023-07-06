
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
var multer = require('multer')
let trackerCookie = require('tracker-cookie')
let trackerFlash = require('tracker-flash-message')

function initializeRequestParse(webhandle) {
	
	// handle JSON bodies
	webhandle.routers.requestParse.use(bodyParser.json({
		limit: process.env.maxUploadSize || '5mb'
	}))
	
	// handle URL encoded bodies
	webhandle.routers.requestParse.use(bodyParser.urlencoded({
		limit: process.env.maxUploadSize || '5mb',
		extended: false
	}));
	
	// Handle file uploads
	let upload = multer({
		dest: process.env.fileUploadDest
	})
	webhandle.routers.requestParse.use(upload.any())
	
	// Parse Cookies
	webhandle.routers.requestParse.use(cookieParser())
	
	// if there is a tracker secret key to provide security
	// add methods which maintain sessions via secure cookies
	if(process.env.trackerSecretKey) {
		webhandle.routers.requestParse.use(trackerCookie(process.env.trackerSecretKey))
		webhandle.routers.requestParse.use(trackerFlash())
		webhandle.routers.requestParse.use((req, res, next) => {
			req.getFlashMessages((messages) => {
				res.locals.flashMessages = messages
				next()
			})
		})
	}

}

module.exports = initializeRequestParse