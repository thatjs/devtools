/*globals require, process, module, console */
/**
 * Proxy server to invoke Jenkins jobs from Github webhooks
 *
 * $ cd /path/thatjs/devtools/appServer
 * $ node jenkinsMockServer.js -> listens on 8087
 * $ node jenkinsProxy.js -> listens on 8086
 *
 * Test proxy:
 * $ curl -i -H "Content-Type: application/json" http://localhost:8086/jenkinsProxy -d '{"refs":"refs/heads/branchName"}'
 *
 * Test jenkins mock
 * $ curl -i http://localhost:8087/jobName%20branchName/build
 *
 * Notes:
 * - jobName%20branchName this needs to match the format used for
 *   jenkin's job urls
 * - curl -d will send "Content-Type: application/x-www-form-urlencoded", use -H to override
 *
 */
var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    debug = require('debug'),
    http = require('http');

// var routes = require('./routes/index');

var app = express();

// view engine setup
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/', routes);

app.post('/jenkinsProxy', function (req, res) {
    console.log(req.body);

    // get "refs" value
    // regex extract branchname
    // build GET url
    // make request



    // console.log('body.refs = ', req.body.refs);

    var job = 'jobName',
        refs = req.body.refs,
        branch = refs.substring(refs.lastIndexOf('/') + 1),
        urlPart = "/" + encodeURIComponent(job + ' ' + branch) + "/build",
        url = "http://localhost:8087" + urlPart;

    console.log('url = ', url);

    var options = {
        host: "localhost",
        port: 8087,
        path: urlPart
    };

    var callback = function(response) {
        console.log(arguments.length);
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str + '\r\n');
            console.log('jenkins request complete' + '\r\n');
        });
    };

    http.request(options, callback).end();

    res.end(JSON.stringify(req.body) + '\r\n'); // working
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers

// Development error handler, print stack trace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// Production error handler, no stack trace
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});

module.exports = app;

app.set('port', process.env.PORT || 8086);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
