/*globals require, process, module, console */
/**
 * Mock jenkins server to confirm correct job POST request
 * url: http://localhost:8087/job/jobName branchName/build
 *
 */
var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    debug = require('debug');

var app = express();

// view engine setup
app.use(logger('combined'));

// leave the hardcoded job path for testing, a match will log it
app.post('/job/jobName%20branchName/build', function (req, res, next) {
    console.log('req.route.path = ', req.route.path);
    res.end();
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

app.set('port', process.env.PORT || 8087);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
