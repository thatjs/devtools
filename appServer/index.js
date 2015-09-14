/**
 * Usage:
 *   var jenkinsProxy = require('./appServer').jenkinsProxy;
 *   jenkinsProxy({
 *      port: 8086,
 *      jenkins: {
 *         port: 8087,
 *         host: 'localhost',
 *         jobName: 'project',
 *         buildBranch: 'dev'
 *      }
 *   });
 *
 */
module.exports = {
    jenkinsProxy: require('./jenkinsProxy')
};