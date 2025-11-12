// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Professional ESLint configuration for NestJS + TypeScript (Flat Config)
 * Keeps compatibility with Prettier and strict CI/CD checks
 * Prevents unnecessary CI failures from DTOs or "any" usage
 * Enforces async safety and consistent coding style
 */

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist',
      'node_modules',
      'coverage',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      // --- TypeScript ---
      '@typescript-eslint/no-explicit-any': 'warn', // allow DTOs, warn instead of fail
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',

      // --- Async & Promises ---
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-misused-promises': 'error',

      // --- Code Hygiene ---
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-trailing-spaces': 'warn',
      'max-depth': ['warn', 4],
      complexity: ['warn', { max: 20 }],

      // --- Prettier Integration ---
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  }
);
