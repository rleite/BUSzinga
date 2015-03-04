var connect = require('connect');
var serveStatic = require('serve-static');
var path = __dirname + '/../app';
var options = { index: 'index.html' };
connect().use(serveStatic(path, options)).listen(8080);