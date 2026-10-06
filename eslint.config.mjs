// @ts-check
// Lints apps/admin, apps/landing and packages/ui. apps/api has its own config.
// The config lives at the root because the app Dockerfiles copy a single app
// directory: the apps must not depend on a workspace-only lint package.
import vueConfig from './packages/eslint-config/vue.mjs';

const primeVueComponents = {
  group: [
    'primevue/*',
    '!primevue/config',
    '!primevue/toastservice',
    '!primevue/confirmationservice',
    '!primevue/use*',
  ],
  message:
    'PrimeVue components are auto-imported in apps/admin templates. Remove the import.',
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.data/**',
      '**/.turbo/**',
      '**/coverage/**',
      'apps/api/**',
      'apps/admin/_templates/**',
      'apps/admin/components.d.ts',
      'packages/shared-types/**',
    ],
  },
  ...vueConfig,
  {
    files: ['apps/admin/src/**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [{ ...primeVueComponents, allowTypeImports: true }] },
      ],
    },
  },
  {
    files: ['apps/landing/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['primevue', 'primevue/*', '@primevue/*', '@gh-skeleton/ui/prime'],
              message:
                'The landing site has no PrimeVue. Import only from @gh-skeleton/ui (core entry).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/ui/src/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['vue-router', 'pinia', 'axios'],
              message:
                'Shared components carry no app concerns: no router, store, or API calls.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'packages/ui/src/core/**/*.{ts,vue}',
      'packages/ui/src/composables/**/*.ts',
      'packages/ui/src/index.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['vue-router', 'pinia', 'axios'],
              message:
                'Shared components carry no app concerns: no router, store, or API calls.',
            },
            {
              group: ['primevue', 'primevue/*', '@primevue/*', '**/prime', '**/prime/**'],
              message:
                'The core entry must not import PrimeVue: the landing site does not install it.',
            },
          ],
        },
      ],
    },
  },
];
