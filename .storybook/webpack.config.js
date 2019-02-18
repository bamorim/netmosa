const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [{
      loader: require.resolve('awesome-typescript-loader')
    }]
  });
  config.resolve.extensions.push('.ts', '.tsx');
  config.resolve.plugins = config.resolve.plugins || [];
  config.resolve.plugins = [
    new TsConfigPathsPlugin({
      configFile: path.resolve(__dirname, '../tsconfig.json')
    })
  ]
  return config;
};