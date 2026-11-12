import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteesLint from 'eslint-plugin-svelte';
import assignmentGroupPadding from './eslint/rules/assignment-group-padding.js';

const paddingLineBetweenStatements = [
  'error',
  { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
  { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
  { blankLine: 'always', prev: '*', next: ['function', 'class'] },
  { blankLine: 'always', prev: ['if', 'for', 'while', 'switch', 'try'], next: '*' },
  { blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'switch', 'try'] },
  { blankLine: 'always', prev: '*', next: 'return' },
  { blankLine: 'always', prev: 'return', next: '*' },
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/build/**',
      '**/target/**',
      '**/.astro/**',
      'brand/me/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelteesLint.configs.recommended,
  prettier,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,svelte}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    plugins: {
      local: { rules: { 'assignment-group-padding': assignmentGroupPadding } },
    },
    rules: {
      'local/assignment-group-padding': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implicit-coercion': 'error',
      'no-new-func': 'error',
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'no-unneeded-ternary': 'error',
      'no-unreachable': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      // @ts-expect-error - mixed array tuple inference limitation in ESLint flat config
      'padding-line-between-statements': paddingLineBetweenStatements,
      'prefer-const': 'error',
      'prefer-template': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
    },
  },
  {
    files: ['**/*.svelte'],
    rules: {
      'prefer-const': 'off',
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: { ...globals.browser },
    },
  },
  {
    files: ['**/*.ts', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
    },
  },
);
