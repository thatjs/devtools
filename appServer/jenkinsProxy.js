/*globals require, process, module, console */
/**
 * Proxy server to invoke Jenkins jobs from Github webhooks
 *
 * $ cd /path/thatjs/devtools/appServer
 * $ node jenkinsMockServer.js -> listens on 8087
 * $ node jenkinsProxy.js -> listens on 8086
 *
 * Test proxy:
 * $ curl -i -H "Content-Type: application/json" http://localhost:8086/jenkinsProxy -d '{"refs":"refs/heads/branchName","repository":{"name": "repoName"}}'
 *
 * Test jenkins mock
 * $ curl -i http://localhost:8087/job/repoName%20branchName/build
 *
 * Notes:
 * - repoName%20branchName this needs to match the format used for
 *   jenkin's job urls, use delimiter for extra information
 *     ex. repoName_release_branchName  - delimiter = '_release_'
 *         repoName tmp branchName      - delimiter = ' tmp '
 * - curl -d will send "Content-Type: application/x-www-form-urlencoded", use -H to override
 *
 * Usage:
 *   var jenkinsProxy = require('./appServer').jenkinsProxy;
 *
 *   // use configuration file for jenkins configuration and jobs
 *   jenkinsProxy({
 *      port: 8086,
 *      debug: true  // default is false
 *   });
 *
 *   // override jenkins configuration and jobs
 *   jenkinsProxy({
 *      port: 8086,
 *      debug: true  // default is false
 *      jenkins: {
 *           port: 8087,
 *           host: 'localhost',
 *           jobs: [{
 *               repoName: 'repoName',
 *               delimiter: ' ',
 *               buildBranch: 'branchName'
 *           }]
 *       }
 *   });
 *
 * Configuration File: config/jenkins.json
 *
 * {
 *   "port": 8087,                       // port for the jenkins instance
 *   "host": "localhost",                // domain name for jenkins instance
 *   "jobs": [{                          // array of jobs to build from webhook
 *       "repoName": "repoName",
 *       "delimiter": " ",
 *       "buildBranch": "branchName"
 *   }]
 *
 * }
 *
 */
var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    debug = require('debug'),
    http = require('http'),
    jenkins = require('../config/jenkins'),

    port = 8086, // proxy server port
    debug = false; // flag

module.exports = function (opts) {

    var app = express();

    // view engine setup
    app.use(logger('combined'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // override defaults if passed as arguments
    if (opts) {

        if (opts.port) {
            port = opts.port;
        }

        if (opts.debug) {
            debug = true;
        }

        if (opts.jenkins) {

            if (opts.jenkins.port) {
                jenkins.port = opts.jenkins.port;
            }

            if (opts.jenkins.host) {
                jenkins.host = opts.jenkins.host;
            }

            if (opts.jenkins.jobs && typeof opts.jenkins.jobs === 'object' && opts.jenkins.jobs.length >= 1) {
                jenkins.jobs = opts.jenkins.jobs;
            }

        }

    }

    app.post('/jenkinsProxy', function (req, res) {

        // console.log(req.body);

        // github webhook push branch information in payload
        // "refs": "refs/head/branchName",
        // "repository": {
        //   "name": "repoName"
        // }

        var job,
            repoName = req.body.repository.name,
            len = jenkins.jobs.length,
            i;

        var refs = req.body.refs,
            branch = refs.substring(refs.lastIndexOf('/') + 1),

            options = {
                host: jenkins.host,
                port: jenkins.port,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            },

            callback = function (response) {
                console.log(arguments.length);
                var str = '';

                //another chunk of data has been recieved, so append it to `str`
                response.on('data', function (chunk) {
                    str += chunk;
                });

                //the whole response has been recieved, so we just print it out here
                response.on('end', function () {
                    console.log('jenkins request complete');
                });
            };

        // only make build request if repository and branch matches configured jobs
        for (i = 0; i < len; i++) {

            job = jenkins.jobs[i];

            if (repoName === job.repoName && branch === job.buildBranch) {
                // set the request url
                options.path = "/job/" + encodeURIComponent(repoName + job.delimiter + branch) + "/build";
                http.request(options, callback).end();
            }
        }

        // close response
        if (debug === true) {
            res.end(JSON.stringify(req.body) + '\r\n'); // dump payload
        } else {
            res.status(200).end();
        }

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

    // module.exports = app;

    app.set('port', port);

    var server = app.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + server.address().port);
    });

};
