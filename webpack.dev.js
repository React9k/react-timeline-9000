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
    static: './dist',
    client: {
      // TAD generates such a warning:
      // WARNING in ./node_modules/mocha/lib/mocha.js 250:26-39
      // Critical dependency: the request of a dependency is an expression
      // W/o a custom loader (to load browser-entry.js as raw), I don't see any solution (besides ignoring this warning).
      overlay: false
    }
  }
});
