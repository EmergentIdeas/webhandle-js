const createTemplateLoader = require('../utils/create-template-loader')

function addTemplateDir(path, { immutable } = {}) {
	let templateCache = immutable ? {} : null
	
	this.views.push(path)
	this.templateLoaders.push(createTemplateLoader(path, templateCache))
}


module.exports = addTemplateDir