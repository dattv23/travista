module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    next: {
      rootDir: ['src/'],
    },
    tailwindcss: {
      config: 'tailwind.config.js',
      callees: ['classnames', 'clsx', 'ctl'],
      cssFiles: ['**/*.css', '**/*.tsx', '**/*.jsx'],
    },
  },
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'tailwindcss'],
  rules: {
    // ⚙️ Tailwind
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'off',

    // ⚙️ TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['node_modules/', '.next/', 'out/', 'build/', 'next-env.d.ts'],
}
