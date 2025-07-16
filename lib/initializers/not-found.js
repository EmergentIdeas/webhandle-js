const filog = require('filter-log')
let log = filog('webhandle:not-found')

function initializeNotFound(webhandle) {
	// catch 404 and forward to error handler
	webhandle.routers.notFound.use(function (req, res, next) {
		let err = new Error('Not Found');
		err.status = 404;

		let rl = Object.assign({}, req)
		delete rl.client
		delete rl.next
		delete rl.connection
		delete rl.res
		delete rl.socket
		delete rl._events

		log.debug(rl)

		next(err);
	});
}

module.exports = initializeNotFound