import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['libraries/**', 'node_modules/**', 'dist/**', 'tests/**', 'data/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        ...globals.serviceworker
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^(changeInfo|removeInfo|tabInfo)$', caughtErrors: 'none' }],
      'no-empty': ['warn', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node }
    }
  }
];
