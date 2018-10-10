const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  entry: {
    "app": "./src/index.ts",
    "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js'
  },
  output: {
    globalObject: 'self',
    filename: "build/[name].bundle.js",
    path: __dirname
  },
  mode: 'development',

  resolve: {
    extensions: [".ts", ".js", ".json"]
  },

  module: {
    rules: [{
        exclude: /node_modules/,
        test: /\.ts?$/,
        loader: "awesome-typescript-loader",
        options: {
          useCache: true,
          useBabel: true
        }
      },

      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [
    new MonacoWebpackPlugin({
      languages: ['lua']
    })
  ]
};