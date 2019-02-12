var webpack = require('webpack');
var config = {
  //devtool: 'inline-source-map',
  plugins: [
    new webpack.NoErrorsPlugin(),
    /*new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_debugger: true,
        drop_console: false,
        keep_fnames: false,
        unsafe: true
      }
    })*/
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015-loose'],
          plugins: ['transform-es3-member-expression-literals', 'transform-es3-property-literals']
        }
      }
    ]
  }
};

module.exports = config;
