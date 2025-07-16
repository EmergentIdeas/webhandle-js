const filog = require('filter-log')
let log = filog('webhandle:requests')
const generator = require('@webhandle/id-generator')

function initRequestLogging(router) {

	let prefix = generator()
	let count = 1

	router.use(function (req, res, next) {
		// Assign the request an identifier so that we can correlate touches early in
		// processing with events late in the process like not-found events.
		req.requestId = prefix + (count++)

		// delete information which can't be serialized
		let rl = Object.assign({}, req)
		delete rl.client
		delete rl.next
		delete rl.connection
		delete rl.res
		delete rl.socket
		delete rl._events

		log.debug(rl)
		next()
	})
}

module.exports = initRequestLogging