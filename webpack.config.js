var webpack = require('webpack');

module.exports = {
  entry: './src/js/root.js',
  output: {
    path: __dirname + '/dist/js',
    filename: "app.js"
  }, 
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
};
