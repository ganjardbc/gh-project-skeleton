import { computed, ref, watch } from 'vue';
import { THEME_STORAGE_KEY } from './themeScript';

export type Theme = 'light' | 'dark';

// False while rendering on a server (SSR / static generation).
const isClient = typeof window !== 'undefined';

function getStored(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

// Shared across every caller, so all toggles stay in sync.
// On a server it stays 'light'; themeInitScript sets the real class before paint.
const current = ref<Theme>('light');

if (isClient) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const getSystemPreference = (): Theme => (media.matches ? 'dark' : 'light');

  current.value = getStored() ?? getSystemPreference();

  watch(
    current,
    (theme) => document.documentElement.classList.toggle('dark', theme === 'dark'),
    { immediate: true, flush: 'sync' },
  );

  // Follow the OS until the user makes an explicit choice.
  media.addEventListener('change', () => {
    if (!getStored()) current.value = getSystemPreference();
  });
}

export function useTheme() {
  const isDark = computed(() => current.value === 'dark');

  function setTheme(theme: Theme) {
    current.value = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage unavailable: the choice lasts for this page load only.
    }
  }

  function toggleTheme() {
    setTheme(current.value === 'light' ? 'dark' : 'light');
  }

  return {
    theme: current,
    isDark,
    setTheme,
    toggleTheme,
  };
}
