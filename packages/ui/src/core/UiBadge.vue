<template>
  <span
    class="inline-flex items-center rounded-full font-medium whitespace-nowrap"
    :class="[VARIANTS[variant], size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-4 py-1 text-sm']"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
<script setup lang="ts">
type Variant = 'primary' | 'neutral' | 'success' | 'info' | 'warn' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-dark-line dark:text-gray-200',
  success: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  warn: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

withDefaults(defineProps<{
  label?: string;
  variant?: Variant;
  size?: 'sm' | 'md';
}>(), {
  variant: 'neutral',
  size: 'sm',
});
</script>
