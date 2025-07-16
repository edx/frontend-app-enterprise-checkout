/* eslint-disable import/no-extraneous-dependencies */
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('eslint', {
  rules: {
    'react/require-default-props': 'off',
  },
  overrides: [
    {
      files: ['*.test.js', '*.test.jsx', '*.test.ts', '*.test.tsx'],
      rules: {
        'react/prop-types': 'off',
        'react/jsx-no-constructed-context-values': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
});
