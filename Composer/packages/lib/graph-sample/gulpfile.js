const gulp = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const ts = require('gulp-typescript');
const replace = require('gulp-replace');
const del = require('del');

const sourceDir = './src';
const targetDir = './dist';
const es5Dir = './lib';
const es6Dir = './es';

/**
 * Clean all contents under 'dist/' folder.
 */
function clean() {
  return del([targetDir, es5Dir, es6Dir]);
}

/**
 * Copy files other than '.ts', '.tsx' to target folders
 */
function copyAssets() {
  return gulp.src(`${sourceDir}/**/!(*.ts|*.tsx)`)
    .pipe(gulp.dest(targetDir));
}

/**
 * Compile '*.scss' files to '*.css' files.
 */
function writeCss(targetFolder) {
  return gulp.src(`${sourceDir}/**/*.scss`)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(targetFolder));
}

/**
 * Used in demo, enable native React component debugging.
 */
function toES6() {
  const tsProject = ts.createProject('tsconfig.json');
  tsProject.options.target = 'ES6';
  tsProject.options.module = 'es6';
  tsProject.options.jsx = 'react-native';
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe(gulp.dest(targetDir));
}


/**
 * TSX / TS -> ES6 module
 */
function toES2015() {
  const tsProject = ts.createProject('tsconfig.json');
  tsProject.options.target = 'ES5';
  tsProject.options.module = 'es6';
  tsProject.options.jsx = 'react';
  return tsProject.src()
    // Replace all occurences of 'import *.scss' to 'import *.css'
    .pipe(replace(/(import.+\.)scss(\'|\")/g, '$1css$2'))
    .pipe(tsProject())
    .js
    .pipe(gulp.dest(es6Dir));
}

/**
 * TSX / TS -> ES2015 module
 */
function toCommonJS() {
  const tsProject = ts.createProject('tsconfig.json');
  tsProject.options.target = 'ES5';
  tsProject.options.module = 'commonjs';
  tsProject.options.lib = ['DOM', 'ES5', 'ScriptHost'];
  return tsProject.src()
    .pipe(replace(/(import.+\.)scss(\'|\")/g, '$1css$2'))
    .pipe(tsProject())
    .js
    .pipe(gulp.dest(es5Dir));
}

const esmodule = gulp.parallel(toES2015, function prepareES6Css() { return writeCss(es6Dir) });
const jsmodule = gulp.parallel(toCommonJS, function prepareES5Css() { return writeCss(es5Dir) });

const buildDemo = gulp.series(clean, gulp.parallel(toES6, copyAssets));
const buildApp = gulp.series(clean, gulp.parallel(esmodule, jsmodule));

exports['build:demo'] = buildDemo;
exports['build:app'] = buildApp;
exports.clean = clean;
exports.lib = jsmodule;
exports.es = esmodule;