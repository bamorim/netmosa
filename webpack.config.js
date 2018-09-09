module.exports = {
  entry: "./src/index.ts",
  output: {
      filename: "bundle.js",
      path: __dirname + "/build"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".js", ".json"]
  },

  module: {
      rules: [
          { exclude: /node_modules/, test: /\.ts?$/, loader: "awesome-typescript-loader" },

          // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
          { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
      ]
  }
};