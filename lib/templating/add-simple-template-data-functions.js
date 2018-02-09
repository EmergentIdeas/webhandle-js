

let addFunctions = function(tri, wh) {
	
	tri.dataFunctions.empty = function(obj) {
		if(obj) {
			if(typeof obj == 'string') {
				return obj.length < 1
			}
			if(typeof obj == 'array') {
				return obj.length < 1
			}
			if(typeof obj == 'object' || typeof obj == 'function') {
				return false
			}
			
		}
		return true
	}
	
	tri.dataFunctions.withDefault = function(value, def) {
		if(tri.dataFunctions.empty(value)) {
			return def
		}
		return value
	}

}

module.exports = addFunctions