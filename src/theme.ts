export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'dev-tools-theme';

export function readSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

export function getPreferredTheme(): Theme {
  const saved = readSavedTheme();
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The active theme still works when storage is unavailable.
  }
}
