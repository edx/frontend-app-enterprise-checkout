/* eslint-disable import/no-extraneous-dependencies */
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('eslint', {
  plugins: ['import', 'unused-imports'],
  rules: {
    'react/require-default-props': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'unused-imports/no-unused-imports': 'error',
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
