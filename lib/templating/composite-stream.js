let PausingTransform = require('pausing-transform')

let compositeStream = function(first, last) {
	
	function flushChain(chain) {
		for(let i = 0; i < chain.length - 1; i++) {
			if(chain[i]._flush) {
				chain[i]._flush()
			}
		}
	}
	
	first.compositeStreams = [first, last]
	first.addStream = function(stream) {
		
		if(typeof stream === 'function') {
			stream = new PausingTransform(stream)
		}
		
		flushChain(first.compositeStreams)
		first.compositeStreams[first.compositeStreams.length - 2].unpipe(last)
		first.compositeStreams[first.compositeStreams.length - 2].pipe(stream).pipe(last)
		first.compositeStreams.pop()
		first.compositeStreams.push(stream)
		first.compositeStreams.push(last)
		
		first.emit('stream:add')
	}
	
	first.pipe(last)
	
	return last
}

module.exports = compositeStream