const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    clean: true,
    libraryTarget: "umd"
  },
  resolve: {
    extensions: ['.ts']
  },
  externals: {
    mobx: "mobx"
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: '/node_modules/'
      }
    ]
  }
}