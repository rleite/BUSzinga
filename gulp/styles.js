var gulp = require('gulp');
var connect = require('gulp-connect');
var config = require('./config.json');

gulp.task('styles-dev', function () {
  console.log('---> STYLES <---');
  gulp.src(config.patthers.styles.css)
    // styles pipeline
    .pipe(connect.reload());
});