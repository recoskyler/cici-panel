module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: { parser: '@typescript-eslint/parser' },
    },
  ],
  rules: {
    'indent': [
      'error',
      2,
      { 'SwitchCase': 1 },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
    'array-bracket-spacing': [
      'error',
      'never',
    ],
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'spaced-comment': [
      'error',
      'always',
      {
        'markers': [
          '!',
          '/',
          '*',
          '?',
        ],
      },
    ],
    'curly': [
      'error',
      'multi-line',
    ],
    'brace-style': [
      'error',
      '1tbs',
      { 'allowSingleLine': true },
    ],
    'arrow-parens': [
      'error',
      'as-needed',
    ],
    'new-parens': [
      'error',
      'never',
    ],
    'space-in-parens': [
      'error',
      'never',
    ],
    'nonblock-statement-body-position': [
      'error',
      'any',
    ],
    'no-unused-vars': [
      'error',
      {
        'vars': 'all',
        'args': 'after-used',
        'ignoreRestSiblings': false,
        'argsIgnorePattern': '^_',
      },
    ],
    'max-len': [
      'error',
      {
        'code': 100,
        'tabWidth': 2,
        'comments': 65,
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreRegExpLiterals': true,
        'ignoreComments': true,
      },
    ],
    'space-infix-ops': 'error',
    'space-before-function-paren': [
      'error',
      {
        'anonymous': 'always',
        'named': 'never',
        'asyncArrow': 'always',
      },
    ],
    'template-curly-spacing': [
      'error',
      'never',
    ],
    'object-curly-newline': [
      'error',
      {
        'ObjectExpression': { 'multiline': true },
        'ObjectPattern': { 'multiline': true },
        'ImportDeclaration': {
          'multiline': true,
          'minProperties': 3,
        },
        'ExportDeclaration': {
          'multiline': true,
          'minProperties': 3,
        },
      },
    ],
    'no-use-before-define': 'error',
    'comma-spacing': 'error',
    'keyword-spacing': 'error',
    'key-spacing': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'padding-line-between-statements': [
      'error',
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'block',
      },
      {
        'blankLine': 'always',
        'prev': 'block',
        'next': '*',
      },
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'block-like',
      },
      {
        'blankLine': 'always',
        'prev': 'block-like',
        'next': '*',
      },
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    'prefer-destructuring': [
      'error',
      {
        'array': true,
        'object': true,
      },
      { 'enforceForRenamedProperties': false },
    ],
    '@typescript-eslint/type-annotation-spacing': 'error',
    'space-before-blocks': 'error',
    'block-spacing': 'error',
    'prefer-const': 'error',
  },
};
