const WebpackConfig = require('./webpack.config');

/**
 * Webpack dev-server
 * @description https://github.com/webpack/webpack-dev-server
 * Use that server to server app
 */
WebpackConfig.devServer = {
    open: true,
        contentBase: './public',
        stats: {
        modules: false,
            cached: false,
            colors: true,
            chunk: false
    },
    historyApiFallback: true,
        host: 'localhost',
        port: 8080,
        hot: true
};

/**
 * raw-loader
 * @description https://github.com/webpack-contrib/raw-loader
 * Load HTML files
 */
WebpackConfig.module.rules.push(
    {
        test: /\.html$/,
        loader: 'raw-loader'
    }
);


module.exports = WebpackConfig;
