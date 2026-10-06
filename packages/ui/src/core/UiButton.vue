<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : type"
    :disabled="href ? undefined : isDisabled"
    :aria-disabled="href && isDisabled ? 'true' : undefined"
    :aria-busy="loading || undefined"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:pointer-events-none"
    :class="[VARIANTS[variant], SIZES[size], { 'w-full': block }]"
  >
    <UiSpinner
      v-if="loading"
      class="size-4!"
    />
    <slot>{{ label }}</slot>
  </component>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import UiSpinner from './UiSpinner.vue';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-dark-line dark:text-gray-100 dark:hover:bg-gray-700',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZES: Record<Size, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-8 py-3 text-base',
};

const props = withDefaults(defineProps<{
  label?: string;
  variant?: Variant;
  size?: Size;
  // Renders an <a> instead of a <button>.
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
});

const isDisabled = computed(() => props.disabled || props.loading);
</script>
