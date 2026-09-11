// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // Single-word component names are the house style for primitives
      // (Navbar, Pagination, Pill). Nuxt auto-import namespaces them anyway.
      'vue/multi-word-component-names': 'off',
    },
  },
)
