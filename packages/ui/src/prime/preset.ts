import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

// Point a PrimeVue palette at the tokens declared in styles/tokens.css, so
// PrimeVue components and Tailwind utilities always share one brand scale.
const scale = (name: string) =>
  Object.fromEntries(SHADES.map((shade) => [shade, `var(--color-${name}-${shade})`]));

export const uiPreset = definePreset(Aura, {
  semantic: {
    primary: scale('primary'),
    secondary: scale('secondary'),
    accent: scale('accent'),
    tertiary: scale('tertiary'),
  },
  components: {
    stepper: {
      steppanel: {
        background: '{surface.ground}',
        color: '{text.color}',
      },
    },
  },
});

// Pass as `app.use(PrimeVue, { theme: uiPrimeVueTheme })`.
export const uiPrimeVueTheme = {
  preset: uiPreset,
  options: {
    prefix: 'p',
    darkModeSelector: '.dark',
    cssLayer: false,
  },
};
