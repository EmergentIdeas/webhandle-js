const filog = require('filter-log')
let log = filog('webhandle:requests')

function initRequestLogging(router) {
	
	router.use(function(req, res, next) {
		let rl = Object.assign({}, req)
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

module.exports = initRequestLogging