/*globals require, process, module, console */
/**
 * Proxy server to invoke Jenkins jobs from Github webhooks
 *
 */
var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    debug = require('debug');

// var routes = require('./routes/index');

var app = express();

// view engine setup
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/', routes);

// ... stopper here, basic /jenkins GET/POST working
// ... next is to setup another node server to
// ... fake the jenkins server listening for
// ... GET localhost:8080/jobName branchName/build
app.get('/jenkins', function (req, res, next) {
    console.log('path /');
    res.end();
});

app.post('/jenkins', function (req, res) {
    console.log(req.body);
    res.end(JSON.stringify(req.body) + '\r\n');
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
