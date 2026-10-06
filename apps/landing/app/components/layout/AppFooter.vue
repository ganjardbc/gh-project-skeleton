<template>
  <footer class="py-12 px-4 border-t border-gray-200 dark:border-dark-line">
    <UiContainer class="flex flex-col md:flex-row items-center justify-between gap-4">
      <NuxtLink :to="localePath('/')" class="flex items-center gap-3">
        <img src="/logo.png" alt="GH Skeleton" class="h-12" />
      </NuxtLink>
      <nav class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <p class="text-gray-400 dark:text-gray-500 text-xs">{{ t.footer.hakCipta }}</p>
    </UiContainer>
  </footer>
</template>

<script setup lang="ts">
import { UiContainer } from '@gh-skeleton/ui'

const t = useMessages()
const localePath = useLocalePath()

const links = computed(() => [
  { label: t.value.footer.tautan.tentang, to: localePath('/about') },
  { label: t.value.footer.tautan.faq, to: localePath('/faq') },
  { label: t.value.footer.tautan.syarat, to: localePath('/terms') },
])
</script>
