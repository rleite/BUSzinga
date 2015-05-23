var path = require('path');

// load all gulp subfiles
require('glob').sync('gulp/**/*.js').forEach(function (file) {
  require('./' + file);
});