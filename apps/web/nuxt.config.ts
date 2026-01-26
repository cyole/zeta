export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  // SPA mode - no SSR
  ssr: false,

  modules: ['@nuxt/ui'],

  icon: {
    provider: 'none',
    clientBundle: {
      icons: ['lucide:sun', 'lucide:moon', 'lucide:circle-alert', 'lucide:loader-circle'],
      scan: true,
    },
  },

  ui: {
    fonts: false,
  },

  // Color mode configuration
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },

  // Dev server
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  // Runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
    },
  },

  // App config
  app: {
    head: {
      title: 'Zeta - 前端提效平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '前端提效平台 - Frontend Efficiency Platform' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // TypeScript
  typescript: {
    strict: true,
  },
})
