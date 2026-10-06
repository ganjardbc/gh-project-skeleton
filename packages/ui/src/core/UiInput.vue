<template>
  <label
    class="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200"
    :class="$attrs.class"
  >
    <span v-if="label || $slots.label">
      <slot name="label">{{ label }}</slot>
    </span>
    <input
      v-bind="inputAttrs"
      v-model="model"
      :type="type"
      :aria-invalid="error ? 'true' : undefined"
      class="w-full rounded-lg border bg-white dark:bg-dark px-3 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'"
    />
    <span
      v-if="error"
      class="text-xs text-red-500"
    >
      {{ error }}
    </span>
    <span
      v-else-if="hint"
      class="text-xs text-gray-400"
    >
      {{ hint }}
    </span>
  </label>
</template>
<script setup lang="ts">
import { computed, useAttrs } from 'vue';

// `class` goes to the wrapper; every other attribute goes to the <input>.
defineOptions({ inheritAttrs: false });

withDefaults(defineProps<{
  label?: string;
  type?: string;
  error?: string;
  hint?: string;
}>(), {
  type: 'text',
});

const model = defineModel<string>({ default: '' });

const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
</script>
