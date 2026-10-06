import tailwindcss from '@tailwindcss/vite'
import { themeInitScript } from '@gh-skeleton/ui/theme-script'

const locales = ['id', 'en']
const pages = ['', '/about', '/faq', '/terms']

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',

  modules: ['@nuxtjs/i18n', '@nuxt/content'],

  css: ['~/assets/css/main.css'],

  // Register components by file name only: <HeroSection>, not <SectionsHeroSection>.
  components: [{ path: '~/components', pathPrefix: false }],

  // @gh-skeleton/ui ships .vue and .ts sources, so Nuxt has to compile it.
  build: {
    transpile: ['@gh-skeleton/ui'],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['vue'],
    },
  },

  // Override with NUXT_PUBLIC_WEB_BASE_URL / NUXT_PUBLIC_API_BASE_URL.
  // The site is generated statically, so the values are fixed at build time.
  runtimeConfig: {
    public: {
      webBaseUrl: 'http://localhost:5173',
      apiBaseUrl: 'http://localhost:3000',
    },
  },

  content: {
    // Use Node's built-in sqlite (Node 22.5+), so no native module has to be compiled.
    experimental: { sqliteConnector: 'native' },
  },

  i18n: {
    defaultLocale: 'id',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'id', language: 'id-ID', name: 'Indonesia' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    // Public URL of this site, used for canonical and hreflang links.
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:5174',
    // A static site cannot redirect per visitor; the URL decides the language.
    detectBrowserLanguage: false,
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/icon.png' }],
      script: [{ innerHTML: themeInitScript, tagPosition: 'head' }],
    },
  },

  nitro: {
    prerender: {
      routes: locales.flatMap((locale) =>
        pages.map((page) => (locale === 'id' ? page || '/' : `/${locale}${page}`)),
      ),
    },
  },
})
