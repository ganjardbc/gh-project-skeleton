<template>
  <section class="pt-16 bg-cream dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-line">
    <UiContainer class="px-4 py-12 md:py-16 text-center">
      <slot name="badge" />
      <h1 class="text-3xl md:text-4xl font-bold text-navy dark:text-white">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
      >
        {{ subtitle }}
      </p>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
import { UiContainer } from '@gh-skeleton/ui'

// Title band at the top of every page except the home page.
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
