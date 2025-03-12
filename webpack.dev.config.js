const { getBaseConfig } = require('@openedx/frontend-build');

const config = getBaseConfig('webpack-dev');

config.module.rules[1].oneOf.forEach((rule, index) => {
  const sassLoaderConfig = rule.use[4];
  const { sassOptions } = sassLoaderConfig.options;
  const updatedSilenceDeprecations = [...sassOptions.silenceDeprecations, 'legacy-js-api'];
  config.module.rules[1].oneOf[index].use[4].options.sassOptions = {
    ...sassOptions,
    silenceDeprecations: updatedSilenceDeprecations,
  };
});

module.exports = config;
