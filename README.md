# Webhandle

A set of mostly configuration tools that makes it easy to use Express and
associated technologies. It puts together great things that already work
and documents how to solve common problems.

## Adding Public Content

```
let webhandle = require('webhandle')
webhandle.addStaticDir('/the/path/to/the/directory')
```



## Templating

Webhandle sets up [tripartite](https://www.npmjs.com/package/tripartite)
logicless-templating, which make it easy to write reusable templates to display 
data. If you can write HTML, you know 90% there. Webhandle also configures
Jade/Pug templates to make it easy to start for those familiar with those languages.

As normal, render a template/page with `res.render('the-template-name')`. 
Any member of `res.locals` is what gets referenced as data in the template.


### Adding a Template Directory

```
let webhandle = require('webhandle')
webhandle.addTemplateDir('/the/path/to/the/directory')
```


### Output Filters

There's great reasons to post-process templated output. For example, you can use 
plain HTML forms for editing data and have the post processor fill in the current
values. You can rewite URLs. You can insert arbitrary script into documents.

A trivial example which will capitalizes everything written:

```
res.addFilter((chunk) => chunk.toString().toUpperCase())

```

You can use either a function or a stream as the filter. Generally, output is 
piped through filters as a whole document, so you'd be able to reparse it with 
`cheerio` or do any other document level work required.

Post-processing a form to add values is makes creating forms, even for editing,
no more difficult than creating the html.

```
const formInjector = require('form-value-injector')
res.addFilter((chunk) => formInjector(chunk, theObjectWhichContainsTheDataToBePutIntoTheForm))

```



## Routing
Express routing is infinitely flexible. Most projects have an understandable, more
constrained request lifecyle though. Webhandle plans that flexibility by adding a 
router for each point in the request lifecycle.

The routers themselves are available from `require('webhandle').routers`. 
The child routers, in the order they are called are:

* preParmParse: a chance to process the request before the body parser, url
parser, cookie parser, etc.
* preStatic: after the request is processed before static file resources are served
* primary: router for normal request handling
* pageServer: renders templates in the pages folder
* postPages: last chance if no pages are matched
* errorHandlers: not normal routers, but a set run on an error
* cleanup: "routers" for after the content has been served

## Parameters, Body, Query, Files

Data from http requests are accessed in the normal Express way. Post parameters are in
`req.body`. Route parameters (/users/:userId/books/:bookId) are available in
`re.params`. Query parameters (/books?bookId=12) are available at `req.query`. 

Uploaded files are available at `req.files`, an array of file objects. By default, 
each file content is available as a buffer in memory.  Each file object has the keys:
```fieldname, originalname, encoding, mimetype, buffer, size```


## Pages
Pages are templates which can be served when matched by name from the URL. So, the
URL /some/page will match a file in the pages folder some/page.tri.

Pages also load page specific information from a json file of the same name, e.g.
some/page.json. This can be used to template structured information or set things
like page title and meta description.

This information is loaded into `res.locals.page`.

### Page Pre-load code
Some pages need information loaded from the database or additional file. This can be done by a page preloader.
The pre-loaders are run after the page specific information is loaded. The slide show,
gallery, calendar event, or some other database identifier can be kept in the page data.

```
webhandle.pageServer.preRun.push((req, res, next) => {
	let tag = req.query.eventTag || res.locals.page.eventTag
	// load some information from the database about the event
	next()
})
```



## Data

* project location on disk: webhandle.projectRoot


## session data tracking

Webhandle sets up encrypted signed cookies (using `tracker-cookie`) which will 
be sent and parsed if used, not otherwise. To set cookie based session 
information:

```
res.track({ myKey: myValue }, () => {
		// callback when encryption is complete
})
```

To read the information

```
req.tracker.myKey
```

Clear like:

```
res.track()
````

### 'Flash' Messages
These are messages, stored in a secure cookie, passed to the client and available on the next request.
Used for storing an error/success message when the server will be issuing a redirect instead of rendering
a response page.

Store:
```
res.addFlashMessage('this is the message', (err) => {
	// Do not end the response until the callback, or the encrypted cookie may not get generated.
})
```

Retrieve:
```
req.getFlashMessages((messages /*array*/) => {
	// errors are swallowed
})
```
Access flash messages in templates like:
```
__flashMessages::message-processing-template__
```

## Events

Complex environments required decoupled notificiations. There are a set of name event emitters at `webhandle.events`. Feel free to add your own.

A general purpose emitter is available at `webhandle.events.global`. A pattern is to issue object change notificiations like:

```
webhandle.events.global.emit('object-change', { /* the object */}, changeType /* create, update, delete */)

## Page Rendering

Templates in the ```pages``` directory are, by default, rendered in response to a url that matches the path within the pages directory if no other piece of code has handled that URL. Page rendering has steps in addition to just rendering the template (loading a page's json file, running page pre-render code).

If a handler wants to have a page rendered, it can set the page path to be any template path like below and the handler can call ```next()``` to pass eventual control to the page renderer.


```
req.pagePath = 'page-template-name'
```

## Environment Data

Services and data which are automatically loaded by webhandle are listed below.

### Databases

Available at:

webhandle.dbs

Where the keys are the database names. The database will have a member <code>db</code> if it is a mongo db (probable) and that will be an object from the mongo package from which you can access the normal objects. 

Getting the products collection will look like:

webhandle.dbs['mydb'].db.collection('products')


