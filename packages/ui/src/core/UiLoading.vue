<template>
  <div class="flex justify-center items-center h-full">
    <UiSpinner class="size-9!" />
    <span class="ml-2 text-sm text-center">{{ message }}</span>
  </div>
</template>
<script setup lang="ts">
import UiSpinner from './UiSpinner.vue';

withDefaults(defineProps<{
  message?: string;
}>(), {
  message: 'Loading...',
});
</script>
