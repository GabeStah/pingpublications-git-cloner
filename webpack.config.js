const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const path = require('path');

module.exports = {
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    // compress: true,
    hot: true
    // port: 9876
  },
  // entry: './src/index.ts',
  entry: ['webpack/hot/poll?1000', path.join(__dirname, 'src/index.ts')],
  // Ignores node_modules during build.
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000']
    })
  ],
  mode: 'development',
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules')],
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
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
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: ['.mjs', '.ts', '.js']
  },
  target: 'node'
};
