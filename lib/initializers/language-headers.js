
function initLanguageHeaders(router) {
	
	router.use((req, res, next) => {
		try {
			let langHeader = req.query['Accept-Language'] || req.get('Accept-Language')
			if(langHeader) {
				res.languages = langHeader.split(',')
				.map(lang => {
					return lang.split(';')[0]
				})
				.map(lang => lang.toLowerCase())
				.filter(lang => !lang.includes('..'))
				.filter(lang => !lang.includes('!'))
				.filter(lang => !lang.includes('/'))
				.filter(lang => !lang.includes('__'))
			}
		}
		catch(ex) {log.error(ex)}
		next()
	})
}

module.exports = initLanguageHeaders