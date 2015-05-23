var gulp = require('gulp');
var connect = require('gulp-connect');
var config = require('./config.json');

var ts = require('gulp-typescript');

gulp.task('scripts', function () {
  console.log('---> SCRIPTS <---');
  gulp.src(config.patthers.scripts.js)
    // scripts pipeline
    .pipe(connect.reload());
});