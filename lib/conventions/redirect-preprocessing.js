
let vrscMatcher = /^\/vrsc\/\d+(\/.*$)/
let tenYearsSec = 10 * 365 * 24 * 60 * 60


function get10Years() {
	let d = new Date()
	d.setTime(d.getTime() + (tenYearsSec * 1000))
	return d
}

function redirectPreprocessor(req, res, next) {
	let wh = require('../../webhandle')	
	
	if(!res.locals.vrsc && process.env.NODE_ENV != 'development') {
		res.locals.vrsc = '/vrsc/' + wh.resourceVersion
	}
	
	let m = req.url.match(vrscMatcher)
	if(m) {
		req.url = m[1]
		let cannonicalUrl = req.protocol + '://' + req.hostname + req.url
		res.set('Link', '<' + cannonicalUrl + '>; rel="canonical"')
		res.set('Expires', get10Years().toUTCString())
		res.set('Cache-Control', 'public, max-age=157680000, must-revalidate')
		return next()
	}
	else {
		next()
	}
}

module.exports = redirectPreprocessor