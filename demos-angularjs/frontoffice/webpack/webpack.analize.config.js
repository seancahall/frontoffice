const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackConfig = require('./webpack.config');

/**
 * Webpack-bundle-analyzer
 * @description https://github.com/webpack-contrib/webpack-bundle-analyzer
 * Use that to control sizes of app
 */
WebpackConfig.plugins.push(
    new BundleAnalyzerPlugin()
);

module.exports = WebpackConfig;