# Webhandle

A set of mostly configuration tools that makes it easy to use Express and
associated technologies. It puts together great things that already work
and documents how to solve common problems.

## Templating

Webhandle sets up [tripartite](https://www.npmjs.com/package/tripartite)
logicless-templating, which make it easy to write reusable templates to display 
data. If you can write HTML, you know 90% there. Webhandle also configures
Jade/Pug templates to make it easy to start for those familiar with those languages.

## Output Filters

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

