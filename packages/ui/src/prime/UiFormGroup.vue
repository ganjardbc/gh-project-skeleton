<template>
  <div
    class="w-full flex-1 flex flex-col gap-2"
    :class="{ 'xl:flex-row': variant !== 'vertical' }"
  >
    <div
      class="w-full flex flex-col gap-0.5"
      :class="{ 'xl:w-95': variant !== 'vertical' }"
    >
      <slot name="label">
        <label
          :for="inputId"
          class="text-sm text-gray-500 font-semibold"
        >
          {{ label || '-' }}

          <span
            v-if="isRequired"
            class="text-red-500"
            aria-hidden="true"
          >*</span>
          <span
            v-if="isOptional"
            class="text-sm font-normal"
          >
            (Optional)
          </span>
        </label>
      </slot>

      <slot
        v-if="hint || $slots.hint"
        name="hint"
      >
        <div class="text-xs text-gray-400">
          {{ hint }}
        </div>
      </slot>
    </div>

    <div class="flex-1 flex flex-col gap-2">
      <slot />

      <slot
        v-if="error || $slots.error"
        name="error"
      >
        <div class="text-xs text-red-500">
          {{ error }}
        </div>
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
  label?: string;
  // id of the control inside the default slot; links the label to it.
  inputId?: string;
  error?: string;
  hint?: string;
  isOptional?: boolean;
  isRequired?: boolean;
  // horizontal: label beside the control from the xl breakpoint up.
  variant?: 'horizontal' | 'vertical';
}>(), {
  variant: 'horizontal',
});
</script>
