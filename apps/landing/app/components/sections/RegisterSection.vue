<template>
  <UiSection
    id="register"
    tone="muted"
    size="sm"
    class="border-t border-gray-200 dark:border-dark-line"
  >
    <UiSectionHeading
      :kicker="t.register.kicker"
      :title="t.register.title"
      :subtitle="t.register.subtitle"
    />

    <UiCard
      variant="outlined"
      padding="lg"
      class="shadow-lg"
    >
      <form @submit.prevent="submitRegistration">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput
            v-model.trim="form.name"
            :label="t.register.fields.name"
            required
          />
          <UiInput
            v-model.trim="form.email"
            :label="t.register.fields.email"
            type="email"
            required
          />
          <UiInput
            v-model="form.password"
            :label="t.register.fields.password"
            type="password"
            minlength="6"
            required
            class="md:col-span-2"
          />
          <UiInput
            v-model.trim="form.merchantName"
            :label="t.register.fields.merchantName"
            required
          />
          <UiInput
            v-model.trim="form.merchantSlug"
            :label="t.register.fields.merchantSlug"
            pattern="[a-z0-9\-]+"
            required
          />
        </div>

        <p v-if="errorMessage" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
        <p v-if="successMessage" class="mt-4 text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>

        <UiButton
          type="submit"
          size="lg"
          block
          class="mt-6"
          :loading="loading"
        >
          {{ loading ? t.register.actions.loading : t.register.actions.submit }}
        </UiButton>
      </form>
    </UiCard>
  </UiSection>
</template>

<script setup lang="ts">
import { UiButton, UiCard, UiInput, UiSection, UiSectionHeading } from '@gh-skeleton/ui'
import { registerMerchant } from '~/services/auth'

const t = useMessages()
const { apiBaseUrl } = useRuntimeConfig().public

const form = reactive({
  name: '',
  email: '',
  password: '',
  merchantName: '',
  merchantSlug: '',
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')

watch(() => form.merchantName, (value) => {
  form.merchantSlug = slugify(value)
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.merchantName = ''
  form.merchantSlug = ''
}

const submitRegistration = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const { messages } = t.value.register

  try {
    await registerMerchant(
      apiBaseUrl,
      {
        name: form.name,
        email: form.email,
        password: form.password,
        merchant: {
          slug: form.merchantSlug,
          name: form.merchantName,
        },
      },
      messages.failed,
    )

    successMessage.value = messages.success
    resetForm()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : messages.failed
  } finally {
    loading.value = false
  }
}
</script>
