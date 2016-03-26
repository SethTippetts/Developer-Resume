var gulp = require('gulp');
var webserver = require('gulp-webserver');
var RevAll = require('gulp-rev-all');
var rimraf = require('rimraf');
var path = require('path');

gulp.task('default', ['watch']);

gulp.task('watch', ['build'], () => {
  gulp.src('public')
    .pipe(webserver({
      livereload: true
    }));
  gulp.watch('source/**/*', ['build']);
});

gulp.task('clean', (done) => rimraf('public', done));

gulp.task('build', ['clean'], () => {
  var revAll = new RevAll({
    dontRenameFile: [/index\.html$/],
    dontSearchFile: [/jpg$/, /png$/],
    transformFilename: function (file, hash) {
      var ext = path.extname(file.path);
      return path.basename(file.path, ext) + '-' + hash.substr(0, 10) + ext; // 3410c.filename.ext
    }
  });
  return gulp.src('source/**/*')
    .pipe(revAll.revision())
    .pipe(gulp.dest('public'));
});
