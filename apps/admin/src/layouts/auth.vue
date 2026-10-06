<template>
  <div class="auth-layout auth-layout--dark">
    <!-- Dark Mode Toggle -->
    <div v-if="ENABLE_DARKMODE_TOGGLE" class="auth-layout__dark-mode">
      <Button
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        severity="secondary"
        variant="text"
        rounded
        @click="toggleTheme"
      />
    </div>

    <slot />
  </div>
</template>
<script lang="ts" setup>
import Button from 'primevue/button';
import { useTheme } from '@gh-skeleton/ui';

const ENABLE_DARKMODE_TOGGLE = false;

const { isDark, toggleTheme } = useTheme();
</script>
<style scoped>
@reference "@/assets/styles/tailwind.css";

.auth-layout {
  @apply relative w-full h-dvh flex items-center justify-center bg-primary;
}

.auth-layout--dark {
  @apply dark:bg-dark;
}

.auth-layout__dark-mode {
  @apply absolute top-6 right-6;
}
</style>
