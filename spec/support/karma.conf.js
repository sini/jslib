module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'karma-typescript'],

        // list of files / patterns to load in the browser
        files: [
            'spec/common/**/*.ts',
            'spec/web/**/*.ts',
            'src/abstractions/**/*.ts',
            'src/enums/**/*.ts',
            'src/models/**/*.ts',
            'src/misc/**/*.ts',
            'src/services/**/*.ts'
        ],

        // list of files to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '**/*.ts': 'karma-typescript'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'karma-typescript', 'kjhtml'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        client:{
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },

        karmaTypescriptConfig: {
            tsconfig: './tsconfig.json',
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
                sourceMap: true
            }
        },
    })
}
