module.exports = function (config) {

  config.set({

    basePath: '',

    frameworks: ['mocha', 'chai', 'sinon'],

    reporters: ['mocha'],

    files: [
      'webpack.tests.js'
    ],

    port: 9876,
    colors: true,
    autoWatch: true,
    singleRun: false,

    logLevel: config.LOG_INFO,

    browsers:  process.env.TRAVIS
      ? ['ChromeTravis']
      : ['Chrome'],


    preprocessors: {
      'webpack.tests.js': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [{ test: /\.js$/, loader: 'babel', exclude: /node_modules/ }]
      }
    },

    webpackServer: {
      stats: { progress: true, modules: false },
      noInfo: true
    },

    customLaunchers: {
      ChromeTravis: {
          base: 'Chrome',
          flags: ['--no-sandbox']
      }
    }

  });
};
