/* eslint-disable import/no-extraneous-dependencies */
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('eslint', {
  plugins: ['import', 'unused-imports'],
  rules: {
    'react/require-default-props': 'off',
    'no-underscore-dangle': ['error', { allow: ['_ctx', '_def'] }],
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
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true, // Let import/order handle the declaration sorting
        ignoreMemberSort: false, // Enable sorting of import members within destructured imports
        allowSeparatedGroups: true,
      },
    ],
    // For multi-line imports, enforce consistent formatting
    'object-curly-newline': [
      'error',
      {
        ImportDeclaration: { consistent: true },
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'unused-imports/no-unused-imports': 'error',
    // Note: To fully enforce each destructured import on its own line,
    // a custom plugin like 'eslint-plugin-import-newlines' would be ideal.
    // This configuration achieves alphabetizing but may not fully enforce
    // the one-import-per-line requirement for all cases.
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
