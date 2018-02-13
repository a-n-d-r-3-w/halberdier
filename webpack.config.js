const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/renderer.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
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
                ]
            }
        ]
    },
    target: 'electron-renderer',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production') // To use production build of React.
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
};
