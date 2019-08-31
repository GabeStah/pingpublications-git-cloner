const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  externals: [nodeExternals({})],
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules')],
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  plugins: [
    /**
     * https://webpack.js.org/plugins/copy-webpack-plugin/
     */
    // Cleanup output directory prior to build.
    new CleanWebpackPlugin(),
    // Add license header.
    new webpack.BannerPlugin({
      banner: `Created by Gabe Wyatt, Owner, Ping Publications LLC
Web: https://www.pingpublications.com
Email: gabe@pingpublications.com
Copyright Gabe Wyatt / Ping Publications LLC © 2019`
    })
    // new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node'
};

// module.exports = {
//   devtool: 'source-map',
//   entry: './src/index.ts',
//   mode: 'production',
//   module: {
//     rules: [
//       {
//         exclude: /(node_modules)/,
//         test: /\.ts$/,
//         use: 'ts-loader'
//       }
//     ]
//   },
//   output: {
//     filename: 'index.js',
//     path: path.resolve('dist')
//   },
//   plugins: [
//     /**
//      * https://webpack.js.org/plugins/copy-webpack-plugin/
//      */
//     // Cleanup output directory prior to build.
//     new CleanWebpackPlugin(),
//     // Add license header.
//     new webpack.BannerPlugin({
//       banner: `Created by Gabe Wyatt, Owner, Ping Publications LLC
// Web: https://www.pingpublications.com
// Email: gabe@pingpublications.com
// Copyright Gabe Wyatt / Ping Publications LLC © 2019`
//     })
//     // new webpack.HotModuleReplacementPlugin()
//   ],
//   resolve: {
//     extensions: ['.mjs', '.ts', '.js']
//   }
// };
