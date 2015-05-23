var gulp = require('gulp');
var config = require('./config.json');

gulp.task('watch', function () {

  // scripts
  gulp.watch(config.patthers.scripts, ['scripts']);

  // markup
  gulp.watch(config.patthers.markup, ['markup']);
});