<template>
  <InputGroup class="h-[42px]">
    <InputText
      v-model="model"
      :placeholder="placeholder"
      size="medium"
      class="w-full"
    />
    <InputGroupAddon>
      <Button
        icon="pi pi-search"
        severity="secondary"
        variant="text"
        aria-label="Search"
      />
    </InputGroupAddon>
  </InputGroup>
</template>
<script setup lang="ts">
import Button from 'primevue/button';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';

withDefaults(defineProps<{
  placeholder?: string;
}>(), {
  placeholder: 'Search...',
});

const model = defineModel<string>({ default: '' });
</script>
