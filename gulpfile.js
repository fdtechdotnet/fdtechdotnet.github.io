'use strict';

var gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var del = require('del');

sass.compiler = require('node-sass');

// Styles ---------------------------------------------------------
var  styles = {
    src: 'src/assets/css/scss/**/*.scss',
    dest: 'src/assets/css',
    filename: 'style.min.css'
}

function cleanStyles() {
  return del([styles.dest + '/' + styles.filename]);
}

function buildStyles() {
 cleanStyles();

  return gulp.src(styles.src)
    .pipe(concat(styles.filename))
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest(styles.dest));
}

function watchStyles() {
  gulp.watch([styles.src], buildStyles);
}

// Scripts ---------------------------------------------------------
var  scripts = {
  src: 'src/assets/js/src/**/*.js',
  dest: 'src/assets/js',
  filename: 'script.min.js'
}

function cleanScripts() {
  return del([scripts.dest + '/' + scripts.filename]);
}

function buildScripts() {
  cleanScripts();

  return gulp.src(scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat(scripts.filename))
    .pipe(gulp.dest(scripts.dest));
}

function watchScripts() {
  gulp.watch([scripts.src], buildScripts);
}

// ---------------------------------------------------------

function watch() {
  watchScripts();
  watchStyles();
}

exports.styles = buildStyles;
exports.scripts = buildScripts;

exports.watch = watch;

exports.clean = gulp.series(cleanStyles, cleanScripts);
exports.build = gulp.series(buildStyles, buildScripts);

exports.default = gulp.series(buildStyles, buildScripts, watch);