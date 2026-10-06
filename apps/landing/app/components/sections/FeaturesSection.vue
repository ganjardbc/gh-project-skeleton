<template>
  <UiSection id="features">
    <UiSectionHeading
      :title="t.features.title"
      :subtitle="t.features.subtitle"
    />
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <UiCard
        v-for="(item, index) in t.features.items"
        :key="index"
        variant="outlined"
        padding="md"
        hoverable
      >
        <div>
          <div class="w-12 h-12 bg-primary-50 dark:bg-primary/90 rounded-lg flex items-center justify-center mb-4">
            <span class="text-xl text-primary dark:text-white font-bold">{{ Number(index) + 1 }}</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ item.description }}</p>
        </div>
      </UiCard>
    </div>
  </UiSection>
</template>

<script setup lang="ts">
import { UiCard, UiSection, UiSectionHeading } from '@gh-skeleton/ui'

const t = useMessages()
</script>
