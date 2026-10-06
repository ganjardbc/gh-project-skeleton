<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-line">
    <UiContainer class="px-4 h-16 flex items-center justify-between gap-6">
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
        <img src="/logo.png" alt="GH Skeleton" class="h-12" />
      </NuxtLink>
      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-3">
        <UiButton
          :href="switchLocalePath(otherLocale)"
          variant="outline"
          size="sm"
          class="font-normal!"
          :aria-label="t.nav.gantiBahasa"
        >
          {{ otherLocale.toUpperCase() }}
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          class="text-lg!"
          :aria-label="isDark ? t.nav.modeTerang : t.nav.modeGelap"
          @click="toggleTheme"
        >
          <!-- The theme is only known in the browser. -->
          <ClientOnly>
            {{ isDark ? '☀️' : '🌙' }}
            <template #fallback>🌙</template>
          </ClientOnly>
        </UiButton>
      </div>
    </UiContainer>
  </header>
</template>

<script setup lang="ts">
import { UiButton, UiContainer, useTheme } from '@gh-skeleton/ui'

const t = useMessages()
const { locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { isDark, toggleTheme } = useTheme()

const otherLocale = computed(() => (locale.value === 'id' ? 'en' : 'id'))

const links = computed(() => [
  { label: t.value.nav.fitur, to: { path: localePath('/'), hash: '#features' } },
  { label: t.value.nav.harga, to: { path: localePath('/'), hash: '#pricing' } },
  { label: t.value.nav.testimoni, to: { path: localePath('/'), hash: '#testimonials' } },
])
</script>
