const { getBaseConfig } = require('@openedx/frontend-build');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const config = getBaseConfig('webpack-dev');

// Silence sass deprecation about legacy-js-api
config.module.rules[1].oneOf.forEach((rule, index) => {
  const sassLoaderConfig = rule.use[4];
  const { sassOptions } = sassLoaderConfig.options;
  const updatedSilenceDeprecations = [...sassOptions.silenceDeprecations, 'legacy-js-api'];
  config.module.rules[1].oneOf[index].use[4].options.sassOptions = {
    ...sassOptions,
    silenceDeprecations: updatedSilenceDeprecations,
  };
});

// Add tsconfig paths plugin
// This is necessary for the webpack dev server to resolve paths correctly.
if (!config.resolve.plugins) {
  config.resolve.plugins = [];
}
config.resolve.plugins.push(new TsconfigPathsPlugin());

module.exports = config;
