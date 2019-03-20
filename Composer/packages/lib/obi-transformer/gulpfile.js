const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');

const commonjsDir = './lib';
const esDir = './es';

function cleanBuild() {
  return del([commonjsDir, esDir]);
}

function toES2015() {
  const tsProject = ts.createProject('tsconfig.json');
  tsProject.options.target = 'ES5';
  tsProject.options.module = 'es6';
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(esDir));
}

function toCommonJS() {
  const tsProject = ts.createProject('tsconfig.json');
  tsProject.options.target = 'ES5';
  tsProject.options.module = 'commonjs';
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(commonjsDir));
}

const build = gulp.series(cleanBuild, gulp.parallel(toES2015, toCommonJS));

exports.build = build;
exports.lib = toCommonJS;
exports.es = toES2015;
