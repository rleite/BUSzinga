var gulp = require('gulp');
var connect = require('gulp-connect');
var config = require('./config.json');

gulp.task('markup-dev', function () {
  console.log('---> MARKUP <---');
  
  gulp.src(config.patthers.markup.html)
    // markup pipeline
    .pipe(connect.reload());
});