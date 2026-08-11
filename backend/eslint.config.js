const globals = require('globals');

module.exports = [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-const-assign': 'error',
      'no-dupe-keys': 'error',
      eqeqeq: 'warn',
    },
  },
];
