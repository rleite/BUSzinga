var gulp = require('gulp');
var connect = require('gulp-connect');
var config = require('./config.json');

gulp.task('server', function() {
  connect.server({
    port: config.server.port,
    root: ['app', 'temp'],
    livereload: true
  });
});


// default gulp files
require('gulp').task('serve', ['server', 'watch']);