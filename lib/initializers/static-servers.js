
function initializeStaticServers(webhandle) {
	webhandle.routers.staticServers.use(function(req, res, next) {
		commingle([...webhandle.staticServers])(req, res, () => {
			next()
		})
	});
}

module.exports = initializeStaticServers