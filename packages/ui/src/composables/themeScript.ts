// No imports here: this file is loaded from build configs (e.g. nuxt.config.ts).

export const THEME_STORAGE_KEY = 'ui-theme';

// Inline in <head> of a server-rendered page. It applies the `.dark` class
// before first paint, so a dark-mode visitor never sees a light flash.
// Must resolve the theme the same way useTheme() does.
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
