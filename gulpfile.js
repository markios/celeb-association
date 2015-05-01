
var browserify = require('browserify');
var gulp = require('gulp');
var _ = require('lodash');
var fs = require('fs');
var aliasify = require('aliasify');
var source = require("vinyl-source-stream");
var nodeResolve = require('resolve');
var bowerResolve = require('bower-resolve');
var less = require('gulp-less');
var path = require('path');
var brfs = require('gulp-brfs');
var minifyCSS = require('gulp-minify-css');
var browserSync = require('browser-sync');

var targetDir = './',
    targetFile = 'src/scripts/main.js',
    destFolder = './built/',
    vendorFile = 'vendor.js',
    destFile = 'main.js';
 

var paths = {
    scripts : ['src/scripts/**/*.js'],
    less    : ['src/style/less/*.less']
};
/**
 * Helper function(s)
 */

var production = (process.env.NODE_ENV === 'production');

var getBowerPackageIds = function() {
    var bowerManifest = {};
    try {
        bowerManifest = require(targetDir + 'bower.json');
    } catch (e) {
        // does not have a bower.json manifest
        console.log('You dont have a bower json');
    }
    return _.keys(bowerManifest.dependencies) || [];
};

var getNPMPackageIds = function() {
    var packageManifest = {};
    try {
        packageManifest = require('./package.json');
    } catch (e) {
        // does not have a package.json manifest
        console.log('You package json manifest');
    }
    return _.keys(packageManifest.dependencies) || [];
};

// start server
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('browserify', function() {
    return browserify(targetDir + targetFile)
      .bundle()
      .pipe(source(destFile))
      .pipe(gulp.dest(destFolder));
});
 
// use default task to launch BrowserSync and watch JS files
gulp.task('default', ['browser-sync'], function () {
    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch(["*.js", "index.html"], ['compile', browserSync.reload]);
});

gulp.task('less', function () {
    return gulp.src(targetDir + '/src/style/less/style.less')
      .pipe(less())
      .pipe(minifyCSS())
      .pipe(gulp.dest(destFolder + 'style'));
});

gulp.task('builder', ['build-vendor', 'build-app']);

gulp.task('build-vendor', function () {
    var b = browserify({
        // generate source maps in non-production environment
        debug: !production
    });
    getNPMPackageIds().forEach(function (id) {
        // var resolvedPath = bowerResolve.fastReadSync(id, { basedir : targetDir + 'vendor' });
        b.require(nodeResolve.sync(id), { expose: id });
    });
    b.transform({global: true}, aliasify);
    var stream = b.bundle().pipe(source('vendor.js'));
    stream.pipe(gulp.dest(destFolder + 'scripts'));
    return stream;
});

gulp.task('build-app', function () {
    var b = browserify(targetDir + targetFile, {
        debug: !production
    });
    getNPMPackageIds().forEach(function (id) {
        b.external(id);
    });
    var stream = b.bundle()
                  .pipe(source(destFile))
                  .pipe(brfs())
                  .pipe(gulp.dest(destFolder + 'scripts'));
    
    return stream;
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['build-app']);
  gulp.watch(paths.less, ['less']);
});

