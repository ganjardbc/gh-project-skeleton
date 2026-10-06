<template>
  <svg
    class="animate-spin size-5"
    viewBox="0 0 24 24"
    fill="none"
    role="status"
    :aria-label="label"
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="3"
    />
    <path
      class="opacity-90"
      d="M22 12a10 10 0 0 0-10-10"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
  label?: string;
}>(), {
  label: 'Loading',
});
</script>
