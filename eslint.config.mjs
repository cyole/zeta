import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,
  pnpm: true,
  markdown: false,
}, {
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
})
