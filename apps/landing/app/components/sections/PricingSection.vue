<template>
  <UiSection id="pricing" tone="muted">
    <UiSectionHeading
      :title="t.pricing.title"
      :subtitle="t.pricing.subtitle"
    />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <UiCard
        v-for="(plan, index) in t.pricing.plans"
        :key="index"
        variant="outlined"
        padding="lg"
        :highlighted="plan.featured"
        :hoverable="!plan.featured"
        :class="{ 'scale-105': plan.featured }"
      >
        <div>
          <UiBadge
            v-if="plan.featured"
            variant="primary"
            size="md"
            class="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            {{ t.pricing.populer }}
          </UiBadge>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ plan.name }}</h3>
          <div class="mb-6">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ plan.price }}</span>
            <span class="text-gray-500 dark:text-gray-400">{{ plan.period }}</span>
          </div>
          <ul class="space-y-3 mb-8">
            <li v-for="(feature, fi) in plan.features" :key="fi" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span class="text-green-500">✓</span>
              {{ feature }}
            </li>
          </ul>
          <UiButton
            :href="registerUrl"
            :variant="plan.featured ? 'primary' : 'outline'"
            size="lg"
            block
          >
            {{ plan.cta }}
          </UiButton>
        </div>
      </UiCard>
    </div>
  </UiSection>
</template>

<script setup lang="ts">
import { UiBadge, UiButton, UiCard, UiSection, UiSectionHeading } from '@gh-skeleton/ui'

const t = useMessages()
const { registerUrl } = useWebLinks()
</script>
