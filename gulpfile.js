var path = require('path');
var fs = require('fs');
var notify = require("gulp-notify");

var gulp = require('gulp');
var gutil = require('gulp-util');
var changed = require('gulp-changed');
var less = require('gulp-less-sourcemap');
var browserify = require('browserify');
var jade = require('gulp-jade');
var browserify = require('gulp-browserify');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var merge = require('merge-stream');

var dirSrc = 'src';
var dirDist = 'dist';

var dirCss = path.join(dirDist);
var dirCssSrc = path.join(dirSrc, 'less');
var entryLess = 'app.less';

var dirJs = dirDist;
var dirJsSrc = path.join(dirSrc, 'js');
var entryJs = 'app.js';

var dirTpl = dirDist;
var dirTplSrc = path.join(dirSrc, 'templates');
var entryTpl = '*.jade';

gulp.task('css:dev', function () {
  return gulp.src(path.join(dirCssSrc, entryLess))
    .pipe(changed(dirCss, {extension: '.css'}))
    
    .pipe(less())

    .on("error", notify.onError({
      message: 'LESS Error: <%= error.message %>',
    }))
    
    .pipe(gulp.dest(dirCss))
    .pipe(notify("Complete: <%= file.relative %>"));
});

gulp.task('css:prod', function () {
  return gulp.src(path.join(dirCssSrc, entryLess))
    .pipe(changed(dirCss, {extension: '.css'}))
    
    .pipe(less())
    .pipe(minifyCSS({keepBreaks: false}))

    .on("error", notify.onError({
      message: 'LESS Error: <%= error.message %>',
    }))
    
    .pipe(gulp.dest(dirCss))
    .pipe(notify("Complete: <%= file.relative %>"));
});

gulp.task('js:dev', function () {
  return gulp.src(path.join(dirJsSrc, entryJs))
    .pipe(browserify({
      insertGlobals : true,
      shim: {
        jQuery: {
          path: 'node_modules/jquery/dist/jquery.js',
          exports: 'jQuery'
        }
      }
    }))

    .on("error", notify.onError({
      message: 'JS Error: <%= error.message %>',
    }))

    .pipe(gulp.dest(dirJs))
    .pipe(notify("Complete: <%= file.relative %>"));
});

gulp.task('js:prod', function () {
  return gulp.src(path.join(dirJsSrc, entryJs))
    .pipe(browserify({
      insertGlobals : true,
      shim: {
        jQuery: {
          path: 'node_modules/jquery/dist/jquery.js',
          exports: 'jQuery'
        }
      }
    }))
    .pipe(uglify())

    .on("error", notify.onError({
      message: 'JS Error: <%= error.message %>',
    }))

    .pipe(gulp.dest(dirJs))
    .pipe(notify("Complete: <%= file.relative %>"));
});

gulp.task('tpl', function() {
  return gulp.src(path.join(dirTplSrc, entryTpl))
    .pipe(changed(dirTpl, {extension: '.jade'}))
    
    .pipe(jade({
      locals: {
        package: require('./package.json'),
        pathToAssets: '.'
      }
    }))

    .on("error", notify.onError({
      message: 'Jade Error: <%= error.message %>',
    }))

    .pipe(gulp.dest(dirTpl))
    .pipe(notify("Complete: <%= file.relative %>"));
});

gulp.task('assets:dev', function(){
  return gulp.src([dirSrc + '/fonts/**/*', dirSrc + '/images/**/*'], {base:dirSrc})
    .pipe(gulp.dest(dirDist))
    .on("error", notify.onError({
      message: 'Assset copy Error: <%= error.message %>',
    }))
    .pipe(notify("Copied Assets."));
});

gulp.task('assets:prod', function(){
  var tubeImage = gulp.src(dirSrc + '/images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .on("error", notify.onError({
      message: 'Image Minification Error: <%= error.message %>',
    }))
    .pipe(gulp.dest('dist'))
    .pipe(notify("Minified image: <%= file.relative %>"));
  
  var tubeFonts = gulp.src(dirSrc + '/fonts/**/*', {base:dirSrc})
    .on("error", notify.onError({
      message: 'Font Copy Error: <%= error.message %>',
    }))
    .pipe(gulp.dest('dist'))
    .pipe(notify("Copied Font: <%= file.relative %>"));

  return merge(tubeImage, tubeFonts);
});

gulp.task('dev', ['assets:dev','tpl','css:dev', 'js:dev']);
gulp.task('prod', ['assets:prod','tpl','css:prod', 'js:prod']);