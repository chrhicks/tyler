/*global require, process, __dirname*/

'use strict';
var path = require('path');
var root = path.join(__dirname, '../..');
var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var Karma = require('karma').Server;
var env = process.env.NODE_ENV || 'test';
var reporter = 'list';

function reportCoverageToCoveralls () {
  gutil.log('Sending LCOV data to Coveralls.io');
  gulp.src('test/coverage/**/lcov.info')
    .pipe(coveralls());
}

/**
 * Testing that Tyler is exposed as a RequireJs module using Karma
 */
gulp.task('test:karma', function (done) {
  gutil.log('Testing Tyler in a RequireJs environment with Karma');
  gutil.log('============================================');

  new Karma({
    configFile: path.join(root, 'karma.conf.js'),
    singleRun: true
  }, function () {
    done();
  }).start();
});

/**
 *  Running unit tests and producing code coverage for coveralls
 */
gulp.task('test:mocha', ['test:karma'], function (done) {
  gutil.log('Testing Tyler in node environment with Mocha');
  gutil.log('============================================');
  gulp.src(['index.js'])
  .pipe(istanbul())
  .pipe(istanbul.hookRequire()) // Force `require` to return covered files
  .on('finish', function () {
    gulp.src(['test/*.js'])
      .pipe(mocha({reporter: reporter}))
      .pipe(istanbul.writeReports({
        dir: 'test/coverage'
      }))
      .on('end', function () {
        if ('ci' === env) {
          reportCoverageToCoveralls();
        }
        done();
      });
  });
});


gulp.task('test', ['test:mocha']);
