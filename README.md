# babel-minify

Some tools, babel plugins and presets to minify ES6+ code or whatever code babel understands.

[![Build Status](https://travis-ci.org/boopathi/babel-minify.svg?branch=master)](https://travis-ci.org/boopathi/babel-minify)

## Try Online

https://boopathi.in/babel-minify/

# :rotating_light: WARNING: EXPERIMENTAL

## Track

+ [x] [mangle](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle)
+ [x] mangle_globals - [mangle-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle#options)
+ [x] [dead_code](https://www.npmjs.com/package/babel-plugin-transform-dead-code-elimination)
+ [x] [conditionals](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-conditionals)
+ [ ] global_defs
+ [x] [evaluate](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-evaluate)
+ [x] [drop_debugger](https://www.npmjs.com/package/babel-plugin-transform-remove-debugger)
+ [x] [drop_console](https://www.npmjs.com/package/babel-plugin-transform-remove-console)
+ [x] properties - [member-expression-literals](https://www.npmjs.com/package/babel-plugin-transform-member-expression-literals), [property-literals](https://www.npmjs.com/package/babel-plugin-transform-property-literals)
+ [x] [join_vars](https://www.npmjs.com/package/babel-plugin-transform-merge-sibling-variables)
+ [x] booleans - [minify booleans](https://www.npmjs.com/package/babel-plugin-transform-minify-booleans)
+ [ ] unsafe - [undefined-to-void](https://www.npmjs.com/package/babel-plugin-transform-undefined-to-void), [simplify-comparison-operators](https://www.npmjs.com/package/babel-plugin-transform-simplify-comparison-operators)
+ [ ] sequences
+ [ ] if_return
+ [ ] cascade
+ [ ] keep_fargs
+ [x] keep_fnames - [mangle-options](https://github.com/boopathi/babel-minify/tree/master/packages/babel-plugin-transform-mangle#options)

## Packages overview

### [gulp-babel-minify](https://github.com/boopathi/babel-minify/blob/master/packages/gulp-babel-minify)

```js
import minify from 'gulp-babel-minify';

gulp.task('min', function() {
  return gulp.src('build/temp/app.bundle.js')
    .pipe(minify(opts))
    .pipe(gulp.dest('build/'));
})
```

### [babel-minify](https://github.com/boopathi/babel-minify/blob/master/packages/babel-minify)

+ Node API + CLI

```js
import minify from 'babel-minify';
minify(inputCode, {
  conditionals: true,
  drop_debugger: true
});
```

More details here - https://github.com/boopathi/babel-minify/blob/master/packages/babel-minify

### [babel-preset-min](https://github.com/boopathi/babel-minify/blob/master/packages/babel-preset-min)

```json
{
  "presets": ["min"],
  "comments": false,
  "compact": true,
  "minified": true
}
```

## Sample App Usage

When you bundle your code, remember to split your bundle into multiple packages or at least `vendor` and your `app` code separately. Usually, the vendor code will be ES5 compatible and UglifyJS does a better job here. And all your code is ES6 and you may want to ship this ES6 code to browsers. So you pass this ES6 code via babel using a specific set of plugins that does the optimizations and minification for you.

**webpack.config.js**

```js
// webpack.config.js
module.exports = {
  entry: {
    app: './src/app.js'
    vendor: ['react', 'react-router', 'lodash', 'my-polyfills']
  },
  output: {
    path: 'build/webpack',
    filename: '[name].bundle.js'
  }
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor')
  ]
}
```

So, this would generate two files - `vendor.bundle.js` & `app.bundle.js`

**gulpfile.js**

```js
const uglify = require('gulp-uglify');
const minify = require('gulp-babel-minify');
const webpack = require('webpack');
const config = require('./webpack.config.js');

gulp.task('webpack', function(cb) {
  webpack(config, (err, stats) => {
    if (err) return cb(err);
    console.log(stats.toString());
    cb();
  });
});

gulp.task('minify-vendor', ['webpack'], function() {
  return gulp.src('build/webpack/vendor.bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/minified'));
});

gulp.task('minify-app', ['webpack'], function() {
  return gulp.src('build/webpack/app.bundle.js')
    .pipe(minify())
    .pipe(gulp.dest('build/minified'));
});
```

## Options



## LICENSE

http://boopathi.mit-license.org
