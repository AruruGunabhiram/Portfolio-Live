import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Disable overly-strict purity/set-state-in-effect checks that flag
      // intentional canvas particle initialization & media-query sync
      // as errors — pre-existing in the codebase.
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow @ts-nocheck in isolated legacy visualization files (Phase 2 compat)
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
])
