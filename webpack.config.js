const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html' // Ensure this path is correct
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve static files from the 'public' directory
    },
    compress: true,
    port: 9000,
    hot: true,
    open: true
  },
  devtool: 'source-map', // Use 'source-map' for better debugging
};
