const { getBaseConfig } = require('@openedx/frontend-build');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const config = getBaseConfig('webpack');

// Add tsconfig paths plugin
// This is necessary for the webpack dev server to resolve paths correctly.
if (!config.resolve.plugins) {
  config.resolve.plugins = [];
}
config.resolve.plugins.push(new TsconfigPathsPlugin());

module.exports = config;
