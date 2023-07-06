var expect = require('chai').expect
var assert = require('chai').assert

let FileSink = require('file-sink')
let createTemplateLoader = require('../lib/utils/create-template-loader')

let testdir = 'test' + (new Date().getTime())
let testpath = '/tmp/' + testdir
let fsTmp = new FileSink('/tmp')
fsTmp.mkdir(testdir)

let fsTest = new FileSink(testpath)

let loader = createTemplateLoader(testpath)

describe("test template loader", function() {
	
	it("setup", function(done) {

		async function run() {
			await fsTest.write('one.tri', 'abc')
			await fsTest.write('one.html', 'def')
			await fsTest.mkdir('two')
			await fsTest.write('two/three.tri', 'ghi')
			
			
			await fsTmp.write('four.tri', 'no')
			done()
		}
		run()
	})
	it("tri template", function(done) {
		async function run() {
			loader('one', (template) => {
				try {
					assert.equal('abc', template)
				}
				catch(e) {
					return done(e)
				}
				done()
			})
		}
		run()
	})
	it("revealed template", function(done) {
		async function run() {
			await fsTest.rm('one.tri')
			loader('one', (template) => {
				try {
					assert.equal('def', template)
				}
				catch(e) {
					return done(e)
				}
				done()
			})
		}
		run()
	})
	it("tri template in subdirectory", function(done) {
		async function run() {
			loader('two/three', (template) => {
				try {
					assert.equal('ghi', template)
				}
				catch(e) {
					return done(e)
				}
				done()
			})
		}
		run()
	})

	it("illegal location", function(done) {
		async function run() {
			loader('two/../../one', (template) => {
				try {
					assert.isNull(template)
				}
				catch(e) {
					return done(e)
				}
				done()
			})
		}
		run()
	})
	it("illegal location 2", function(done) {
		async function run() {
			loader('~/one', (template) => {
				try {
					assert.isNull(template)
				}
				catch(e) {
					return done(e)
				}
				done()
			})
		}
		run()
	})
	
	it("immutable setup", function(done) {

		loader = createTemplateLoader(testpath, {immutable: true})
		done()
	})
	it("tri template from immutable", function(done) {
		async function run() {
			loader('one', (template) => {
				try {
					assert.equal('def', template)
				}
				catch(e) {
					return done(e)
				}
				done()
			})
		}
		run()
	})
	it("tri template from immutable, file deleted", function(done) {
		async function run() {
			await fsTest.rm('one.html')
			loader('one', (template) => {
				try {
					assert.equal('def', template)
				}
				catch(e) {
					return done(e)
				}
				done()
			})
		}
		run()
	})

	it('cleanup', function() {
		fsTmp.rm(testdir)
		fsTmp.rm('four.tri')
	})

})