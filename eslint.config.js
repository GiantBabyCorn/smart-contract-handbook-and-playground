import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

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
  },
  // JSX bare-string guard (plan.md §7 語言品質): every user-visible string in
  // components/pages must go through i18n. Whitespace-only JSX text is ignored
  // by the rule itself; punctuation/symbol-only glyphs are allowlisted below.
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: false,
          ignoreProps: true,
          noAttributeStrings: false,
          allowedStrings: [
            '·',
            '—',
            '–',
            '→',
            '←',
            '↑',
            '↓',
            '×',
            '+',
            '-',
            '/',
            ':',
            '.',
            '(',
            ')',
            '%',
            '#',
            '...',
            '…',
            '•',
            '≈',
          ],
        },
      ],
    },
  },
  prettierConfig,
]);
