const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/renderer.js',
    output: {
        filename: 'bundle.js',
        publicPath: '' // Recommended by https://webpack.js.org/migrate/5/ to resolve runtime error.
    },
    devtool: 'eval-source-map',
    resolve: {
        extensions: [".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }, {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]'
                        }
                    }
                ],
                type: 'javascript/auto' // Stop Webpack's Asset Module from processing assets again as that would result in asset duplication. See https://webpack.js.org/guides/asset-modules/.
            }
        ]
    },
    target: 'electron-renderer',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production') // To use production build of React.
        })
    ]
};
