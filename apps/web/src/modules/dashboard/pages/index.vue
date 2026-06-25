<template>
  <div class="w-full flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-dark-secondary rounded-lg border border-gray-100 dark:border-dark">
    <div class="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
      <i class="pi pi-home text-blue-500 text-3xl"></i>
    </div>
    <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
      Welcome to GH Skeleton Project
    </h1>
    <p class="text-gray-500 dark:text-gray-400 max-w-md text-base leading-relaxed mb-8">
      A point-of-sale and business management skeleton application designed for UMKM. Manage users, roles, permissions, merchants, and uploads seamlessly.
    </p>
    <div class="flex flex-wrap gap-4 justify-center">
      <router-link to="/merchants">
        <Button label="Manage Merchants" icon="pi pi-shop" severity="primary" size="medium" />
      </router-link>
      <router-link to="/users">
        <Button label="Manage Users" icon="pi pi-users" severity="secondary" variant="outlined" size="medium" />
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple static dashboard page for GH Skeleton Project
</script>

<style scoped></style>
