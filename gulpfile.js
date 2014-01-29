require('colors')
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    bump = require('gulp-bump'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    pkg = require('./package.json'),
    jasmine = require('gulp-jasmine'),
    coffee = require('gulp-coffee');


/*
  Default Gulp Task. Can be ran via the following commands.
    ```bash
      gulp
      gulp code
    ```

  This will watch any changes on files within src
    Then run jshint and test the code

 */

var code = function(){
  gulp.watch('src/*', function(){
    gulp.src('src/*.js')
      .pipe(jshint()) // JSHint
      .pipe(jshint.reporter('jshint-stylish'));

    testCode();
  });
}


/*
  Build Tools. This function can be ran at command line by:
    `gulp build --type STRING`

  It will run a jslint, code test, version bump,
    uglifyier, minifiyer.

  @params (String) build bump ammount
    major = first number = 1.0.0
    minor = second number = 0.1.0
    patch = third number = 0.0.1
 */

var buildDist = function(a, b,c){
  var bumpTypes = ['major', 'minor', 'patch'];
  var bumpType = gutil.env.type;

  if (!bumpType) {
    console.log("\nYou must pass a build bump type [major, minor, patch]".red);
    console.log("\nRun the function again passing --type. \n i.e.  gulp build --type patch\n".red);
    return;
  }

  // Check if type matches a needed bump version
  if (bumpTypes.lastIndexOf(bumpType.toLowerCase()) == -1)
    return console.log("\nInvalid build type. Must be major, minor, or patch\n".red);

  // test
  testCode();

  // Bump Version number
  gulp.src('./package.json')
    .pipe(bump({ type: bumpType.toLowerCase() }))
    .pipe(gulp.dest('./'));

  // Build Minified and unmified copies
  gulp.src('src/*.js')
    .pipe(jshint()) // jslint
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(uglify()) // Uglify && Minify
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(gulp.dest('dist/scripts'))

  gulp.src('src/*.js')
    .pipe(jshint()) // jslint
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(rename(pkg.name + '.js'))
    .pipe(gulp.dest('dist/scripts'))

  // TODO: Build CSS 
  gulp.src('src/*.css')
    .pipe(gulp.dest('dist/stylesheets'))
}


/*
  Test Tool. This function can be ran at command line by:
    `gulp test`

  It will compile coffeescript jasmine tests and run them
 */

var testCode = function(){
  gulp.src('./test/*.coffee')
    .pipe(coffee({ bare: true }).on('error', gutil.log)) // coffeescript compile
    .pipe(gulp.dest('test'))
    .pipe(jasmine()); // Run jasmine tests
}


gulp.task('default', code);
gulp.task('code', code);
gulp.task('build', buildDist);
gulp.task('test', testCode);
