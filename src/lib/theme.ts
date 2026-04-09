/** Persistencia del tema del panel (clase `dark` en <html>). */
export const THEME_STORAGE_KEY = 'cmr-theme';

export type ThemeChoice = 'light' | 'dark';

export function readThemeChoice(): ThemeChoice | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  if (v === 'light' || v === 'dark') return v;
  return null;
}

export function isDarkDom(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/** Aplica tema y guarda preferencia explícita. */
export function setTheme(choice: ThemeChoice) {
  if (typeof window === 'undefined') return;
  const dark = choice === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(THEME_STORAGE_KEY, choice);
}

/** Primer arranque: sin clave en localStorage usa `prefers-color-scheme`. */
export function initThemeFromStorageOrSystem() {
  if (typeof window === 'undefined') return;
  const saved = readThemeChoice();
  let dark: boolean;
  if (saved === 'dark') dark = true;
  else if (saved === 'light') dark = false;
  else dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
}
