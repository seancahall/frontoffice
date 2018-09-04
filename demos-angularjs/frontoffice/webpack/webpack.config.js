const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv');
const Webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VersionFile = require('webpack-version-file');
const VersionHash = require("randomstring").generate();

/**
 * Run dotenv
 * It convert .env file to pocess.ENV variables
 * That variables are defined below to access them from app
 */
Dotenv.config();

const config = {
    context: Path.join(__dirname, '..', 'src'),
    entry: [
        './app/vendors/usa-and-canada.js',
        './app/vendors/us-all.js',
        './app/vendors/europe.js',
        './app/vendors/appcues-integration.js',
        './app/vendors/live-person-integration.js',
        './index.js',
    ],
    output: {
        path: Path.resolve(__dirname, 'public'),
        publicPath: '/',
        filename: '[name].[hash].js',
        chunkFilename: '[name].[hash].js',
    },
    module: {
        rules: [
            /**
             * babel-loader
             * @description https://github.com/babel/babel-loader
             * Use babel to compile ES<x> to ES5
             * Using .babelrc file for settings
             */
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'eslint-loader'
                    },
                    {
                        loader: 'babel-loader'
                    }
                ]
            },

            /**
             * url-loader
             * @description https://github.com/webpack-contrib/url-loader
             * Load images, also below 8kb image create base64 inline image
             */
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8000,
                        name: 'images/[hash]-[name].[ext]'
                    }
                }]
            },

            /**
             * url-loader
             * @description https://github.com/webpack-contrib/url-loader
             * Load fonts in woof/woof2 format
             */
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff'
                    }
                }]
            },

            /**
             * file-loader
             * @description https://github.com/webpack-contrib/file-loader
             * Load fonts in ttf/eot/svg format in easiest way
             */
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [{
                    loader: 'file-loader'
                }]
            },

            /**
             * sass-loader
             * @description https://github.com/webpack-contrib/sass-loader
             * Load styles in sass/scss files (also css available)
             */
            {
                test: /\.(sass|scss)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        /**
         * HtmlWebpackPlugin
         * @description https://github.com/jantimon/html-webpack-plugin
         * Insert js file automatically into html main file
         */
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: 'body',
        }),

        /**
         * DefinePlugin
         * @description https://webpack.js.org/plugins/define-plugin/
         * Create own plugins or constants to be available in app
         */
        new Webpack.DefinePlugin({
            ENDPOINT: JSON.stringify(process.env.ENDPOINT),
            OAUTH: JSON.stringify(process.env.OAUTH),
            VERSION: JSON.stringify(process.env.VERSION),
        }),

        /**
         * VersionFile
         * @description https://github.com/fknussel/webpack-version-file
         * Generate version file for build
         * Here is used for compare client version with server side version
         */
        new VersionFile({
            output: 'src/app/assets/VERSION.html',
            data: {
                version: VersionHash
            }
        }),

        /**
         * CopyWebpackPlugin
         * @description @https://github.com/webpack-contrib/copy-webpack-plugin
         * Copy assets to build location
         */
        new CopyWebpackPlugin([
            { from: 'app/assets', to: Path.resolve(__dirname, 'public', 'assets') },
        ]),

        /**
         * ProvidePlugin
         * @description https://webpack.js.org/plugins/provide-plugin/
         * Make third party libraries available in app without definition
         */
        new Webpack.ProvidePlugin({
            _: 'lodash',
            $: 'jquery',
            jQuery: 'jquery',
            moment: 'moment',
            Highcharts: 'highcharts/highmaps.src.js',
            d3: 'd3',
        })
    ],

    /**
     * optimization
     * @description https://github.com/webpack/docs/wiki/optimization
     * That section is configured by specific environment settings
     */
    optimization: {
        minimizer: []
    }
};

module.exports = config;
