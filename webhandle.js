let webhandleCreator = require('./webhandle-creator')


if(!global.webhandle) {
	global.webhandle = webhandleCreator()
}


module.exports = global.webhandle
