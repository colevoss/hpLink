require('colors')
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    bump = require('gulp-bump'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    pkg = require('./package.json'),
    jasmine = require('gulp-jasmine'),
    prompt = require('prompt'),
    coffee = require('gulp-coffee'),
    git = require('gulp-git'),
    wait = require('gulp-wait'),
    removeLogs = require('gulp-removelogs'),
    notify = require('gulp-notify'),
    minifyCSS = require('gulp-minify-css'),
    cssLint = require('gulp-csslint'),
    header = require('gulp-header');

var banner = ['/**', ' * <%= pkg.name %> ', ' * @version v<%= pkg.version %> ', ' * @link <%= pkg.homepage %> ', ' * @license <%= pkg.licenses.type %> ', ' */ \n\n'].join("\n");
var cssBanner = ['/**', ' * <%= pkg.name %> ', ' * @version v<%= pkg.version %> ', ' * @link <%= pkg.homepage %> ', ' * @license <%= pkg.licenses.type %> ', ' * ', ' * Modify this file if you would like styling to fit more into your page. ', ' */ \n\n'].join("\n");
var cssMinBanner = ['/**', ' * <%= pkg.name %> ', ' * @version v<%= pkg.version %> ', ' * @link <%= pkg.homepage %> ', ' * @license <%= pkg.licenses.type %> ', ' */ \n\n'].join("\n");

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

    gulp.src('src/*.css')
      .pipe(cssLint({'box-sizing': false}))
      .pipe(cssLint.reporter())

    testCode();
  });
}

/*
  Build Tools. This function can be ran at command line by:
    `gulp build --type STRING`

  It will run a jslint, code test, version bump,
    uglifyier, minifiyer, console.log remover, script header.

  @params (String) build bump ammount
    major = first number = 1.0.0
    minor = second number = 0.1.0
    patch = third number = 0.0.1

  @params (BashArg) --release Optional.
    If this is passed, it will push the code to github
    and create a release.
 */

var buildDist = function(){
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

  prompt.start();
  prompt.get('Confirm Build Process (y/n)'.green, function(err, result){
    result = result[Object.keys(result)[0]]
    if (result != 'y') return;

    testCode(); // Run Tests

    // Bump Version number
    gulp.src('./package.json')
      .pipe(bump({ type: bumpType.toLowerCase() }))
      .pipe(gulp.dest('./'));

    // Build Minified and unminified Javascript
    gulp.src('src/*.js')
      .pipe(jshint()) // jslint
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(header(banner, {pkg: pkg}))
      .pipe(uglify()) // Uglify && Minify
      .pipe(removeLogs())
      .pipe(rename(pkg.name + '.min.js'))
      .pipe(gulp.dest('dist/scripts'))

    gulp.src('src/*.js')
      .pipe(jshint()) // jslint
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(removeLogs())
      .pipe(header(banner, {pkg: pkg}))
      .pipe(rename(pkg.name + '.js'))
      .pipe(gulp.dest('dist/scripts'))

    // Build Minified and unminified copies of CSS
    gulp.src('src/*.css')
      .pipe(header(cssBanner, {pkg: pkg}))
      .pipe(cssLint({'box-sizing':false}))
      .pipe(cssLint.reporter())
      .pipe(gulp.dest('dist/stylesheets'));

    gulp.src('src/*.css')
      .pipe(minifyCSS())
      .pipe(header(cssMinBanner, {pkg: pkg}))
      .pipe(rename(pkg.name + '.min.css'))
      .pipe(gulp.dest('dist/stylesheets'))
      .pipe(notify({ message: pkg.name + " Version: " + pkg.version + " successfully built."}));

    // Create Github Release
    if (gutil.env.release){
      var tagName = "v" + pkg.version;

      gulp.src('./')
        .pipe(wait(2000))
        .pipe(git.add())
        .pipe(git.commit("[RELEASE: "+ pkg.version +"]" + pkg.name + " " + Date.now()))
        .pipe(git.push('origin', 'master'))
        .pipe(git.tag(tagName, pkg.version + "Release"))
        .pipe(git.push('origin', tagName));
    }

  });
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


/*
  Bash Implementations.
 */

gulp.task('default', code);
gulp.task('code', code);
gulp.task('build', buildDist);
gulp.task('test', testCode);
