<template>
  <UiSection id="testimonials" size="md">
    <UiSectionHeading
      :title="t.testimonials.title"
      :subtitle="t.testimonials.subtitle"
    />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <UiCard
        v-for="(item, index) in t.testimonials.items"
        :key="index"
        variant="outlined"
        padding="md"
      >
        <div>
          <p class="text-gray-600 dark:text-gray-300 mb-6 italic">"{{ item.quote }}"</p>
          <div class="flex items-center gap-3">
            <UiWrapIcon
              size="40px"
              bgColor="bg-primary-50 dark:bg-primary/90"
              iconColor="text-primary dark:text-white"
              class="font-bold"
            >
              {{ item.name.charAt(0) }}
            </UiWrapIcon>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ item.name }}</p>
              <p class="text-gray-500 dark:text-gray-400 text-xs">{{ item.role }}</p>
            </div>
          </div>
        </div>
      </UiCard>
    </div>
  </UiSection>
</template>

<script setup lang="ts">
import { UiCard, UiSection, UiSectionHeading, UiWrapIcon } from '@gh-skeleton/ui'

const t = useMessages()
</script>
