<template>
  <details class="group border-b border-gray-200 dark:border-dark-line">
    <summary class="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-base font-semibold text-gray-900 dark:text-white rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      {{ question }}
      <svg
        class="size-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 8l5 5 5-5" />
      </svg>
    </summary>
    <p class="pb-5 text-gray-600 dark:text-gray-300 leading-relaxed">
      {{ answer }}
    </p>
  </details>
</template>

<script setup lang="ts">
// Native <details>: opens with mouse, Enter, or Space, and works without JavaScript.
defineProps<{
  question: string
  answer: string
}>()
</script>
