const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [],
  module: {
    rules: [
      {test: /\.tsx?$/, exclude: /node_modules/, loader: 'ts-loader'},
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
      {test: /\.jss$/, exclude: /node_modules/, loader: 'babel-loader'},
      {test: /\.css$/, use: [{loader: 'style-loader'}, {loader: 'css-loader'}]}
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, './node_modules'), path.resolve(__dirname, './src')],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  stats: {
    colors: true
  }
};
