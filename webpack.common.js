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
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
      {
        test: /\.(ts|tsx)$/,
        use: [{
          loader: "ts-loader"
        }]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        type: "asset/resource"
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
    modules: [
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, './src')
    ],
    // needed by mocha
    fallback: {
      // here we don't polyfill; we just say to webpack: if you encounter this import, please don't complain that you don't find it
      "stream": false,
      "path": false,
      "fs": false,
      // however, here the above technique wasn't enough; so a real polyfill is needed
      // cf. https://webpack.js.org/configuration/resolve/#resolvefallback
      stream: require.resolve('stream-browserify'),
    }
  },
  stats: {
    colors: true
  }
};
