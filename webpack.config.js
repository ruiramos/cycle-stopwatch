var path = require('path');

module.exports = {
  entry: "./app/main.js",
  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath: '/dist/',
    filename: "bundle.js"
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['react', 'es2015']
        }
      },
      {test: /\.css?$/, loader: 'style-loader!css-loader'}, 
      {test: /\.less?$/, loader: 'style-loader!css-loader!less-loader'},
    ]
  }
};
