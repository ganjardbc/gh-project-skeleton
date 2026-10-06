// Resolver for unplugin-vue-components. Plain JS so a Vite config can import it
// without a build step. Keep both lists in sync with src/index.ts and
// src/prime/index.ts.

const core = [
  'UiBadge',
  'UiButton',
  'UiCard',
  'UiCardHeader',
  'UiContainer',
  'UiEmptyState',
  'UiInput',
  'UiLoading',
  'UiPercentage',
  'UiSection',
  'UiSectionHeading',
  'UiSpinner',
  'UiWrapIcon',
];

const prime = [
  'UiAdvanceFilter',
  'UiConfirmDialog',
  'UiFileUpload',
  'UiFormField',
  'UiFormGroup',
  'UiGlobalLoading',
  'UiPagination',
  'UiSearch',
  'UiSwitch',
  'UiToast',
];

export function GhUiResolver() {
  return {
    type: 'component',
    resolve: (name) => {
      if (core.includes(name)) return { name, from: '@gh-skeleton/ui' };
      if (prime.includes(name)) return { name, from: '@gh-skeleton/ui/prime' };
    },
  };
}
