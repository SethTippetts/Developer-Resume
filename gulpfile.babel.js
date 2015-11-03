import gulp from 'gulp';
import gulpif from 'gulp-if';
import header from 'gulp-header';
import sass from 'gulp-sass';
import minifyCSS from 'gulp-minify-css';
import path from 'path';
import RevAll from 'gulp-rev-all';
import runSequence from 'run-sequence';
import useref from 'gulp-useref';
import { sync as del } from 'rimraf';
import livereload from 'gulp-livereload';

import pkg from './package.json';

let dest = 'public', cwd = 'source', tmp = 'tmp';
let sources = {
  all: ['**/*'],
  scripts: ['**/*.js'],
  documents: ['**/*.html'],
  images: ['**/*.png', '**/*.jpg', '**/*.svg'],
  fonts: ['**/*.eot', '**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.otf'],
  sass: ['**/*.sass', '**/*.scss'],
  styles: ['**/*.css'],
};

gulp.task('default', [ 'watch' ]);
gulp.task('start', ['build']);
gulp.task('compile', ['images', 'styles', 'scripts', 'documents', 'fonts']);

gulp.task('build', () => {
  return runSequence('clean', 'compile', 'reference', 'revision', 'cleanup')
});
gulp.task('build:dev', () => {
  return runSequence('compile', 'development', 'cleanup');
});

// Cleanup
gulp.task('clean', () => del(dest));
gulp.task('cleanup', () => del(tmp));

// Assets
gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('images', images);
gulp.task('fonts', fonts);
gulp.task('documents', documents);

// Prod only version management
gulp.task('revision', revision);
gulp.task('reference', reference);

// Dev commands
gulp.task('work', ['watch']);
gulp.task('watch', ['build:dev'], watch);
gulp.task('development', development);

function reference() {
  let assets = useref.assets();
  let htmlComment = header('<!-- ' + pkg.name + ' v' + pkg.version + ' -->\n\n');
  let scriptComment = header('/* ' + pkg.name + ' v' + pkg.version + ' */\n\n');
  return gulp.src('tmp/**/*.html')
    .pipe(gulpif(sources.documents, htmlComment))
    .pipe(assets)
    .pipe(gulpif(sources.styles, minifyCSS({ keepSpecialComments: 0 })))
    .pipe(gulpif(sources.scripts.concat(sources.styles), scriptComment))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest(tmp));
}

function revision() {
  let revAll = new RevAll({
    dontRenameFile: [/\.html$/],
    dontSearchFile: [/vendor/, /jpg$/, /png$/],
    transformFilename: function (file, hash) {
      var ext = path.extname(file.path);
      return path.basename(file.path, ext) + '-' + hash.substr(0, 10) + ext; // 3410c.filename.ext
    }
  });
  return gulp.src(sources.all, { cwd: tmp })
    .pipe(revAll.revision())
    .pipe(gulp.dest(dest));
}

function development() {
  return gulp.src(sources.all, { cwd: tmp })
    .pipe(gulp.dest(dest))
    .pipe(livereload());
}

function watch() {
  livereload.listen();
  gulp.watch('source/**/*', ['build:dev']);
}

// Asset compilation
function styles() {
  return gulp.src(sources.sass.concat(sources.styles), { cwd })
    .pipe(gulpif(sources.sass, sass()))
    .pipe(gulp.dest(tmp));
}

function scripts() {
  return gulp.src(sources.scripts, { cwd })
    .pipe(gulp.dest(tmp));
}

function images() {
  return gulp.src(sources.images, { cwd })
    .pipe(gulp.dest(tmp));
}

function fonts() {
  return gulp.src(sources.fonts, { cwd })
    .pipe(gulp.dest(tmp));
}

function documents() {
  return gulp.src(sources.documents, { cwd })
    .pipe(gulp.dest(tmp));
}

