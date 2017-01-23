const gulp = require('gulp');
const path = require('path');
const packageJson = require('./package.json');
const ghPages = require('gh-pages');
const runSequence = require('run-sequence');
const swPrecache = require('sw-precache');

const DEV_DIR = 'src';
const DIST_DIR = 'dist';

function writeServiceWorkerFile(rootDir, handleFetch, callback) {
  var config = {
    cacheId: packageJson.name,

    // If handleFetch is false (i.e. because this is called from generate-service-worker-dev), then
    // the service worker will precache resources but won't actually serve them.
    // This allows you to test precaching behavior without worry about the cache preventing your
    // local changes from being picked up during the development cycle.
    handleFetch: handleFetch,
    staticFileGlobs: [
      rootDir + '/assets/css/**.css',
      rootDir + '/assets/js/**.js',
      rootDir + '/**.html',
      'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.6/handlebars.js',
      'https://cdn.jsdelivr.net/pouchdb/6.1.1/pouchdb.min.js',
    ],
    stripPrefix: rootDir + '/',
    // verbose defaults to false, but for the purposes of this demo, log more.
    verbose: true
  };

  swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
}

gulp.task('default', ['serve-dist']);

gulp.task('build', function(callback) {
  runSequence('copy-dev-to-dist', 'generate-service-worker-dist', callback);
});

gulp.task('gh-pages', ['build'], function(callback) {
  ghPages.publish(path.join(__dirname, DIST_DIR), callback);
});

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile(DEV_DIR, false, callback);
});

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(DIST_DIR, true, callback);
});

gulp.task('copy-dev-to-dist', function() {
  return gulp.src(DEV_DIR + '/**')
    .pipe(gulp.dest(DIST_DIR));
});
