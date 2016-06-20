var webpack = require('webpack');
var bsSettings = {};
try {
  bsSettings = require('./bs_settings.json');
} catch (e) {
  console.log('Error loading bs_settings.json file:', e);
}


module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'test/index.js'
    ],


    // list of files to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/index.js': ['webpack'] // , 'sourcemap'
    },

    webpack: require('./webpack.config.js'),

    webpackMiddleware: {
      noInfo: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    plugins: [
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-browserstack-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-sourcemap-loader',
      'karma-webpack'
    ],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'PhantomJS'
    ],

    customLaunchers: {
      Chrome_hidden: {
        base: 'Chrome',
        flags: [
          '--window-size=400,400',
          '--window-position=-400,0'
        ]
      },
      bs_firefox_mac: {
        base: 'BrowserStack',
        browser: 'firefox',
        os: 'OS X',
        os_version: 'El Capitan'
      },
      bs_chrome_mac: {
        base: 'BrowserStack',
        browser: 'chrome',
        os: 'OS X',
        os_version: 'El Capitan'
      },
      bs_ie6: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '6.0',
        os: 'Windows',
        os_version: 'XP'
      },
      bs_ie7: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '7.0',
        os: 'Windows',
        os_version: 'XP'
      },
      bs_ie8: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '8.0',
        os: 'Windows',
        os_version: '7'
      },
      bs_ie9: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '9.0',
        os: 'Windows',
        os_version: '7'
      }
    },

    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      // todo: we cannot set this to true without phantomjs crashing see: https://github.com/karma-runner/karma-phantomjs-launcher/issues/125
      exitOnResourceError: false
    },

    browserStack: bsSettings,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
