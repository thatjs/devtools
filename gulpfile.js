/*globals require, process */
var startTime = +new Date(),
    gulp = require('gulp'),
    gUtil = require('gulp-util'),
    argv = require('minimist')(process.argv.slice(2)),

    jslint = require('gulp-jslint'),
    requireDir = require('require-dir'),
    shell = require('gulp-shell'),

    gulpSync = require('gulp-sync')(gulp),
    os = require('os'),
    debug = require('gulp-debug');

var srcGulp = 'gulpfile.js',
    srcSvr = 'appServer/*.js',
    devSrc = [srcGulp, srcSvr];

var config = require('./config/gulp');


gulp.task('lint', function () {
    return gulp.src(devSrc)
        .pipe(jslint(config.jslint));
});

gulp.task('info', function () {
    return gulp.src('')
        .pipe(shell([
            'gulp --version'
        ]));
});

// include as the last task to display the total build time
gulp.task('totalTime', function () {
    var totalTime = new Date(+new Date() - startTime);
    gUtil.log('=== total build time = ' + gUtil.colors.green(totalTime / 1000) + ' sec ===');
    return gUtil.noop(); // return the stream
});

// gulp public API
// ===============

// use config/jenkins.json
gulp.task('jenkinsProxy', function () {
    var proxy = require('./appServer').jenkinsProxy;
    proxy({
        port: 8086
    });
});

// override config/jenkins.json
gulp.task('jenkinsProxy2', function () {
    var proxy = require('./appServer').jenkinsProxy;
    proxy({
        port: 8086,
        jenkins: {
            port: 8087,
            host: 'localhost',
            jobs: [{
                repoName: 'jobName',
                delimiter: ' ',
                buildBranch: 'branchName'
            }]
        }
    });
});

// base case and build
gulp.task('default', ['info']);
