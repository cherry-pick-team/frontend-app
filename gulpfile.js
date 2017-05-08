const gulp = require('gulp');
const path = require('path');
const del = require('del');
const history = require('connect-history-api-fallback');
const $ = require('gulp-load-plugins')({
  pattern: ['*', '!jshint', '!connect-history-api-fallback']
});

const environment = $.util.env.type || 'development';
const isProduction = environment === 'production';
const webpackConfig = require('./webpack.config.js')[environment];

const port = $.util.env.port || 9001;
const src = 'src/';
const dist = 'dist/';

gulp.task('scripts', () => {
  return gulp.src(webpackConfig.entry)
    .pipe($.webpackStream(webpackConfig))
    .on('error', function (error) {
      $.util.log($.util.colors.red(error.message));
      this.emit('end')
    })
    .pipe(gulp.dest(dist + 'js/'))
    .pipe($.size({title: 'js'}))
    .pipe($.connect.reload())
});

gulp.task('html', () => {
  return gulp.src(src + 'index.html')
    .pipe(gulp.dest(dist))
    .pipe($.size({title: 'html'}))
    .pipe($.connect.reload())
});

gulp.task('styles', () => {
  return gulp.src(src + 'styles/main.scss')
    .pipe(isProduction ? $.emptyPipe() : $.sourcemaps.init())
    .pipe($.sass({outputStyle: isProduction ? 'compressed' : 'expanded'}))
    .pipe(isProduction ? $.emptyPipe() : $.sourcemaps.write())
    .pipe(gulp.dest(dist + 'css/'))
    .pipe($.connect.reload())
});

gulp.task('serve', () => {
  $.connect.server({
    root: dist,
    port: port,
    livereload: {
      port: 35728
    },
    middleware: (connect, opt) => {
      return [history(), require('http-proxy-middleware')(['/api', '/crop'], {
        target: 'http://zsong.ru',
      })]
    }
  })
});

gulp.task('static', (cb) => {
  return gulp.src(src + 'static/**/*')
    .pipe($.size({title: 'static'}))
    .pipe(gulp.dest(dist + 'assets/'))
});

gulp.task('watch', () => {
  gulp.watch(src + 'styles/**/*.scss', ['styles']);
  gulp.watch(src + 'index.html', ['html']);
  gulp.watch([src + 'app/**/*.js', src + 'app/**/*.hbs'], ['scripts'])
});

gulp.task('lint', () => {
  return gulp.src([src + 'app/**/*.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'))
});

gulp.task('clean', (cb) => {
  del([dist], cb)
});

gulp.task('default', ['build', 'serve', 'watch']);

gulp.task('build', (cb) => {
  if (isProduction) {
    $.runSequence('clean', 'lint', 'static', 'html', 'scripts', 'styles', cb)
  } else {
    $.runSequence('clean', 'static', 'html', 'scripts', 'styles', cb)
  }
});
