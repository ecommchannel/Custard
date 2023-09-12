const path = require('path');

module.exports = {

  mode: 'development',

  entry: "./checkout-custom/index.js",

  module: {

    rules: [

      {

        test: /\.(js|jsx)$/,

        exclude: /(node_modules|bower_components)/,

        use: {

          loader: 'babel-loader',

          options: {

            presets: ['@babel/preset-env']

          }

        }

      }

    ]

  },

  resolve: {

    extensions: ["*", ".js", ".jsx"]

  },

  output: {

    path: __dirname,

    publicPath: "/",

    filename: "checkout-custom.js",

    path: path.resolve(__dirname, 'assets')

  }

};