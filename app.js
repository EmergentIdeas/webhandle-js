let express = require('express');
let path = require('path');
const fs = require('fs')
const pageServer = require('webhandle-page-server')

module.exports = function(projectRoot) {

    let app = express()
    let wh = require('./webhandle')
    wh.projectRoot = projectRoot

    wh.addTemplateDir(path.join(projectRoot, 'views'))
    wh.addTemplateDir(path.join(projectRoot, 'pages'))

    wh.addStaticDir(path.join(projectRoot, 'public'))
    wh.init(app)


    require.main.require('./server-js/add-routes')(wh.router)


    wh.pageServer = pageServer(path.join(projectRoot, 'pages'))
    wh.router.use(wh.pageServer)

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
    return app
}