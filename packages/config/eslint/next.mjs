// @ts-check
import reactLib from './react-lib.mjs';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  ...reactLib,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
];
