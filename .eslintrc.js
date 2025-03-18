/* eslint-disable import/no-extraneous-dependencies */
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('eslint', {
  rules: {
    'react/require-default-props': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
});
