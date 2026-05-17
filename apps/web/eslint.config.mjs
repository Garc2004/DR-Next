import next from '@dr/config/eslint/next';

export default [
  ...next,
  {
    ignores: ['.next/**', 'next-env.d.ts', 'public/**'],
  },
];
