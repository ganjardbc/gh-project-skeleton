<template>
  <UiFormGroup
    :label="label"
    :inputId="inputId"
    :hint="hint"
    :isOptional="isOptional"
    :isRequired="isRequired"
    :variant="variant"
  >
    <slot />
    <Message
      v-if="field?.invalid"
      severity="error"
      size="small"
      variant="simple"
    >
      {{ field.error?.message }}
    </Message>
  </UiFormGroup>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Message from 'primevue/message';
import UiFormGroup from './UiFormGroup.vue';

// One labelled field of a @primevue/forms <Form>, with its validation message:
//
//   <Form v-slot="$form" ...>
//     <UiFormField label="Name" name="name" :form="$form">
//       <InputText name="name" fluid />
//     </UiFormField>
//   </Form>
const props = withDefaults(defineProps<{
  label?: string;
  // Field name, matching the `name` of the control in the default slot.
  name: string;
  // The `$form` slot prop of the surrounding <Form>.
  form?: Record<string, any>;
  inputId?: string;
  hint?: string;
  isOptional?: boolean;
  isRequired?: boolean;
  variant?: 'horizontal' | 'vertical';
}>(), {
  variant: 'vertical',
});

const field = computed(() => props.form?.[props.name]);
</script>
