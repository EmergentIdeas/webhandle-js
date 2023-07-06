var expect = require('chai').expect
var assert = require('chai').assert
const express = require('express')

describe("environment start integration test", function() {
	
	it("setup", function(done) {

		let app = express()
		let wh = require('../webhandle')
		wh.projectRoot = '.'
		wh.init(app, () => {
			done()
		})
	})
	
})
