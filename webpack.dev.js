const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  entry: './src/demo_index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'React Timeline 9000',
      template: 'src/demo.html',
      chunksSortMode: 'auto',
      inject: 'body',
      minify: {
        removeComments: false,
        collapseWhitespace: false
      }
    })
  ],
  devServer: {
    static: './dist'
  }
});
