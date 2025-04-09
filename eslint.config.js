import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'client/dist/**', 'node_modules/**', '*.config.js', '*.config.ts']
  },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Customized rules
      'react/react-in-jsx-scope': 'off',  // Not needed in React 17+
      'react/prop-types': 'off',  // Using TypeScript instead
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_'
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // You might want to customize jsx-a11y rules here later if needed
    }
  }
];
