module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended', // Added accessibility rules
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'], // Added jsx-a11y plugin
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
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
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.ts'],
};
