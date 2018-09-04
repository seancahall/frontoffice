const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WebpackConfig = require('./webpack.config');

/**
 * In production scripts
 * Minify and uglify JS files
 * @description https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 */
WebpackConfig.optimization.minimizer.push(
    new UglifyJSPlugin({
        uglifyOptions: {
            ecma: 8,
            warnings: false,
            ie8: false,
            output: {
                comments: false,
                beautify: false
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
                ecma: 8
            }
        }
    })
);

/**
 * raw-loader
 * @description https://github.com/webpack-contrib/raw-loader
 * Also used @https://github.com/sapics/html-minifier-loader
 * Get HTML files and minify them before process
 */
WebpackConfig.module.rules.push(
    {
        test: /\.html$/,
        loader: 'raw-loader!html-minifier-loader'
    }
);


module.exports = WebpackConfig;