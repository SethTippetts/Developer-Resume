import gulp from 'gulp';
import gulpif from 'gulp-if';
import header from 'gulp-header';
import livereload from 'gulp-livereload';
import minifyCSS from 'gulp-minify-css';
import path from 'path';
import RevAll from 'gulp-rev-all';
import gzip from 'gulp-gzip';
import runSequence from 'run-sequence';
import sass from 'gulp-sass';
import useref, { assets as userefAssets } from 'gulp-useref';
import webserver from 'gulp-webserver';
import { sync as del } from 'rimraf';
import pkg from './package.json';


let dest = 'public', cwd = 'source', tmp = 'tmp';

let defaultCompile = (src, dest, cwd) => {
  return gulp.src(src, { cwd })
    .pipe(gulp.dest(dest));
};

let tasks = [
  {
    name: 'scripts',
    src: ['**/*.js'],
  },
  {
    name: 'documents',
    src: ['**/*.html'],
  },
  {
    name: 'images',
    src: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.gif'],
  },
  {
    name: 'fonts',
    src: ['**/*.eot', '**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.otf'],
  },
  {
    name: 'styles',
    src: ['**/*.css'],
  },
  {
    name: 'sass',
    src: ['**/*.sass', '**/*.scss'],
    compile: (src, dest, cwd) => {
      return gulp.src(src, { cwd })
        .pipe(sass())
        .pipe(gulp.dest(dest));
    }
  },
];

tasks.map(task => {
  task.compile = task.compile || defaultCompile;
  return task;
});

gulp.task('server', () => {
  gulp.src('public')
    .pipe(webserver({
      port: 3000,
      livereload: true,
    }));
})

gulp.task('default', ['watch', 'server']);

gulp.task('clean', () => del(dest));
gulp.task('cleanup', () => del(tmp));

// Prod only version management
gulp.task('revision', revision);
gulp.task('reference', reference);

gulp.task('build', () => {
  return runSequence('clean', 'assets', 'reference', 'revision', 'cleanup')
});

let assetKeys = tasks
  .map(task => {
    let { name, src, compile } = task;
    gulp.task(name, compile.bind(this, src, tmp, cwd));
    gulp.task(devKey(name), () => {
      return compile(src, dest, cwd)
        //.pipe(livereload());
    });
    return name;
  });

gulp.task('assets', assetKeys)
gulp.task('assets:dev', assetKeys.map(devKey));

gulp.task('watch', ['assets:dev'], () => {
  //livereload.listen();
  tasks
    .map(task => {
      let { name, src } = task;
      src = src.map(src => prefix('source', src));
      gulp.watch(src, [devKey(name)], { cwd })
    });
});

function prefix(pre, str) {
  if (str.charAt(0) === '!') return str;
  return `${pre}/${str}`;
}

function devKey(key) {
  return `${key}:dev`;
}

let sources = tasks.reduce((prev, { name, src }) => {
  prev[name] = src;
  return prev;
}, {});

function reference() {
  let assets = userefAssets();
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
    dontRenameFile: [/index\.html$/],
    dontSearchFile: [/vendor/, /jpg$/, /png$/],
    transformFilename: function (file, hash) {
      var ext = path.extname(file.path);
      return path.basename(file.path, ext) + '-' + hash.substr(0, 10) + ext; // 3410c.filename.ext
    }
  });
  return gulp.src('**/*', { cwd: tmp })
    .pipe(revAll.revision())
    .pipe(gulp.dest(dest))
    .pipe(gzip())
    .pipe(gulp.dest(dest));
}
