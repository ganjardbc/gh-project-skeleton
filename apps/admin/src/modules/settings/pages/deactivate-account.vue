<template>
  <UiCard class="max-w-2xl mx-auto">
    <template #header>
      <h1 class="text-xl font-semibold">
        Deactivate Account
      </h1>
    </template>

    <Form
      v-if="isLoaded"
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
    >
      <div class="w-full space-y-4">
        <Message
          severity="warn"
          size="small"
          variant="simple"
        >
          <strong>Warning:</strong> This action cannot be undone. Your account will be permanently deactivated and all your data will be deleted after 30 days.
        </Message>

        <UiFormField name="confirmDeactivation" :form="$form">
          <div class="flex items-center gap-2">
            <Checkbox
              name="confirmDeactivation"
              :binary="true"
              input-id="confirm-deactivation"
            />
            <label for="confirm-deactivation" class="text-sm">
              I understand that this action is permanent and cannot be undone
            </label>
          </div>
        </UiFormField>

        <UiFormField label="Confirm with Password" name="password" :form="$form">
          <Password
            name="password"
            placeholder="Enter your password to confirm"
            :feedback="false"
            fluid
          />
        </UiFormField>

        <UiFormGroup label="Reason for Deactivation (Optional)" variant="vertical">
          <Textarea
            name="reason"
            placeholder="Tell us why you're deactivating your account"
            rows="3"
            fluid
          />
        </UiFormGroup>
      </div>

      <div class="w-full flex justify-end gap-4">
        <Button
          severity="secondary"
          label="Cancel"
          size="medium"
          class="w-full md:w-[128px]"
          @click="onCancel"
        />
        <Button
          type="submit"
          severity="danger"
          label="Deactivate"
          size="medium"
          class="w-full md:w-[128px]"
        />
      </div>
    </Form>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { isHasPermission } from '@/helpers/auth.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import { showToast, showConfirm } from '@/helpers/toast.ts';
import { showLoading, hideLoading } from '@/helpers/loading.ts';
import { UiCard } from '@gh-skeleton/ui';
import { UiFormField, UiFormGroup } from '@gh-skeleton/ui/prime';
import { Form } from '@primevue/forms';
import { deactivateAccount } from '@/modules/settings/services/api.ts';
import { ACCOUNT_DEACTIVATE } from '@/modules/settings/services/rbac.ts';
import type { DeactivateAccountDto } from '@/modules/settings/services/types';

const router = useRouter();

// RBAC
const isCanDeactivate = computed(() => isHasPermission(ACCOUNT_DEACTIVATE));

// Form state
const isLoaded = ref(true);
const initialValues = ref({
  confirmDeactivation: false,
  password: '',
  reason: '',
});

const resolver = ref(zodResolver(
  z.object({
    confirmDeactivation: z.boolean().refine((val) => val === true, {
      message: 'You must confirm to deactivate your account.',
    }),
    password: z.string().min(1, { message: 'Password is required to confirm deactivation.' }),
    reason: z.string().optional(),
  })
));

// Submit
const onFormSubmit = async ({ valid, values }: { valid: boolean; values: any }) => {
  if (valid) {
    showConfirm({
      header: 'Deactivate Account',
      message: 'Are you absolutely sure? This action cannot be undone. Your account will be permanently deactivated.',
      rejectLabel: 'Cancel',
      acceptLabel: 'Yes, Deactivate',
      type: 'warn',
      accept: () => {
        submitDeactivation(values);
      },
    });
  }
};

// Submit deactivation
const submitDeactivation = async (values: any) => {
  try {
    showLoading();

    const payload: DeactivateAccountDto = {
      password: values.password,
      reason: values.reason || undefined,
    };

    const response = await deactivateAccount(payload);
    const { success } = response?.data || {};

    if (success) {
      showToast({
        type: 'success',
        title: 'Account Deactivated',
        message: 'Your account has been deactivated. You will be logged out.',
      });
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push({ name: 'login' });
      }, 2000);
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to deactivate account.',
    });
  } finally {
    hideLoading();
  }
};

// Navigation
const onCancel = () => {
  router.back();
};

onMounted(() => {
  if (!isCanDeactivate.value) {
    router.push({ name: 'settings' });
  }
});
</script>

<style scoped></style>
