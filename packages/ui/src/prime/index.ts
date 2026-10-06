// PrimeVue entry: components here require primevue to be installed in the app.
export { default as UiAdvanceFilter } from './UiAdvanceFilter.vue';
export { default as UiConfirmDialog } from './UiConfirmDialog.vue';
export { default as UiFileUpload } from './UiFileUpload.vue';
export { default as UiFormField } from './UiFormField.vue';
export { default as UiFormGroup } from './UiFormGroup.vue';
export { default as UiGlobalLoading } from './UiGlobalLoading.vue';
export { default as UiPagination } from './UiPagination.vue';
export { default as UiSearch } from './UiSearch.vue';
export { default as UiSwitch } from './UiSwitch.vue';
export { default as UiToast } from './UiToast.vue';

export { useGlobalConfirm } from './composables/useGlobalConfirm';
export type { ShowConfirmParams } from './composables/useGlobalConfirm';
export { useGlobalLoading } from './composables/useGlobalLoading';
export { useGlobalToast } from './composables/useGlobalToast';
export type { ShowToastParams } from './composables/useGlobalToast';

export { uiPreset, uiPrimeVueTheme } from './preset';
