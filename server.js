/*jshint esversion: 6 */

const host = 'http://127.0.0.1';
const port = 12701;

var logger = require('./logger');

var http = require('http');
var handler = require('./gitlab_webhook_handler')({ path: '/webhook' });

// creat a GitLab webhook server
http.createServer(function (req, res) {
    handler(req, res, function () {
        res.statusCode = 404;
        res.end(`no such location: ${req.url}`);
    });
}).listen(port);

logger.info(`GitLab Hook Server running at ${host}:${port}/webhook`)

// handle gitlab events
handler.on('error', function (err) {
    console.error('Error:', err.message);
});

handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
});

handler.on('issues', function (event) {
    console.log('Received an issue event for %s action=%s: #%d %s',
        event.payload.repository.name,
        event.payload.action,
        event.payload.issue.number,
        event.payload.issue.title);
});

handler.on('merge', function (event) {
    console.log('Received an merge event for %s action=%s: #%d %s',
        event.payload.repository.name,
        event.payload.description);
});