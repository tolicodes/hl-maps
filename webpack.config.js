const LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require('path');


module.exports = {
  entry: './src/',
  plugins: [
    new LiveReloadPlugin(),
  ],
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'index.js',
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        'style-loader', // creates style nodes from JS strings
        'css-loader', // translates CSS into CommonJS
        'sass-loader', // compiles Sass to CSS, using Node Sass by default
      ],
    }, {
      test: /\.js$/,
      use: ['source-map-loader'],
      enforce: 'pre',
    }, {
      test: /\.(html)$/,
      use: {
        loader: 'html-loader',
        options: {
          interpolate: true,
        },
      },
    },
    {
      test: /\.(png|jp(e*)g|svg)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8000000, // Convert images < 8kb to base64 strings
          name: 'images/[hash]-[name].[ext]',
        },
      }],
    }],
  },
};
