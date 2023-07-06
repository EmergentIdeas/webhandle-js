let FileSink = require('file-sink')

function createTemplateLoader(path, templateCache) {
	let fs = new FileSink(path)
	let loader = function(name, callback) {
		if(templateCache && name in templateCache) {
			return callback(templateCache[name])
		}
		async function run() {
			let buffer
			try {
				buffer = await fs.read(name + '.tri')
			}
			catch(e) {
				try {
					buffer = await fs.read(name + '.html')
				}
				catch(e) {}
			}
			let template = buffer ? buffer.toString() : null
			if(templateCache) {
				templateCache[name] = template
			}
			callback(template)

		}
		run()
	}
	loader.fs = fs
	loader.cache = templateCache
	
	return loader
}

module.exports = createTemplateLoader