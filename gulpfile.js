/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var load = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var proxy = require('proxy-middleware');
var historyApiFallback = require('connect-history-api-fallback');

var DIST = 'dist';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

// Copy All Files At The Root Level (app)
gulp.task('copy', function() {
  var app = gulp.src([
    'app/*',
    '!app/elements',
    '!app/test',
    '!app/bower_components',
    '!app/cache-config.json',
    '!**/.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest(dist()));

  return merge(app)
    .pipe(load.size({title: 'copy'}));
});

// Clean output directory
gulp.task('clean', function() {
  return del(['.tmp', dist()]);
});

var serve = function(baseDir) {
  browserSync({
    port: 3636,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: baseDir,
      middleware: [historyApiFallback()]
    }
  });
};

// Watch Files For Changes & Reload
gulp.task('serve', function () {
  serve(['app']);

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.css'], [reload]);
  gulp.watch(['app/elements/**/*.css'], [reload]);
  gulp.watch(['app/{scripts,elements}/**/*.js'], [reload]);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  serve(['dist']);

  gulp.watch(['app/**/*.html'], ['default', reload]);
  gulp.watch(['app/styles/**/*.css'], ['default', reload]);
  gulp.watch(['app/elements/**/*.css'], ['default', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    'copy',
    'build',
    cb);
});

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {}
