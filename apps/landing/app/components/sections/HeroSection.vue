<template>
  <section id="hero" class="w-full pt-16 bg-cream dark:bg-dark">
    <UiContainer class="px-4 py-12 grid md:grid-cols-[1fr_380px] items-center">
      <div class="flex-1 flex flex-col justify-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-navy dark:text-white leading-tight">
          GH Skeleton
        </h1>

        <p class="text-lg md:text-xl text-primary font-medium mb-4">
          {{ t.hero.tagline }}
        </p>

        <p class="text-base text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed mb-8">
          {{ t.hero.deskripsi }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3 mb-8">
          <UiButton
            :href="loginUrl"
            size="lg"
            class="shadow-lg shadow-primary/25"
          >
            {{ t.hero.masuk }}
          </UiButton>
          <UiButton
            :href="registerUrl"
            variant="outline"
            size="lg"
          >
            {{ t.hero.daftar }}
          </UiButton>
        </div>

        <p class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
          <span class="inline-block w-1 h-1 rounded-full bg-green-400" />
          {{ t.hero.kepercayaan }}
        </p>
      </div>

      <div class="hidden md:flex aspect-square relative items-center justify-center bg-cream dark:bg-dark-secondary overflow-hidden rounded-2xl shadow-lg shadow-primary/25">
        <img
          src="/banner.png"
          alt="GH Skeleton Banner"
          class="w-full h-full object-cover"
        />
      </div>
    </UiContainer>

    <div class="bg-cream dark:bg-dark-secondary border-t border-gray-200 dark:border-dark-line">
      <UiContainer class="px-6 md:px-12 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          <div v-for="(stat, i) in stats" :key="i" class="text-center">
            <p class="text-2xl md:text-3xl font-bold text-primary">{{ stat.value }}</p>
            <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </UiContainer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { UiButton, UiContainer } from '@gh-skeleton/ui'

const t = useMessages()
const { loginUrl, registerUrl } = useWebLinks()

const stats = computed(() => [
  { value: '10rb+', label: t.value.hero.stats.pengguna },
  { value: '500rb+', label: t.value.hero.stats.transaksi },
  { value: '5rb+', label: t.value.hero.stats.outlet },
  { value: '5+', label: t.value.hero.stats.tahun },
])
</script>
