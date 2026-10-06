import { createApp } from 'vue';

// Main application component
import App from '../App.vue';
const vueInit = createApp(App);

// Setup router
import { setupRouter } from './global-routes';
const router = setupRouter();
vueInit.use(router);

// Setup Pinia
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
const pinia = createPinia();
pinia.use(createPersistedState({ storage: localStorage }));
vueInit.use(pinia);

// Setup PrimeVue components
import PrimeVue from 'primevue/config';
import { uiPrimeVueTheme } from '@gh-skeleton/ui/prime';

vueInit.use(PrimeVue, { theme: uiPrimeVueTheme });

import ToastService from 'primevue/toastservice'; 
vueInit.use(ToastService);

import ConfirmationService from 'primevue/confirmationservice';
vueInit.use(ConfirmationService);

// Mount after router resolves initial location to prevent first-paint layout mismatch.
router.isReady().then(() => {
  vueInit.mount('#app');
});

export default vueInit;
