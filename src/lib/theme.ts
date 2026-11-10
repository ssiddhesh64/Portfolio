import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

const readStored = (): Theme | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
};

const systemTheme = (): Theme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

/** The theme currently applied to <html>; index.html sets it before paint. */
export const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

/**
 * Prerendered HTML can't know the visitor's theme, so the server renders
 * light. During hydration React uses this snapshot too, then re-renders with
 * the real one, so theme-dependent markup never mismatches.
 */
const serverTheme = (): Theme => 'light';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
};

/** Re-renders when <html data-theme> changes; used by theme-aware renderers. */
export const useAppliedTheme = (): Theme =>
  useSyncExternalStore(subscribe, currentTheme, serverTheme);

export const useTheme = () => {
  const theme = useAppliedTheme();

  // Follow the OS setting until the visitor picks a theme explicitly.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = () => {
      if (!readStored()) document.documentElement.dataset.theme = systemTheme();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode): the choice lasts for this page view.
    }
  }, []);

  return { theme, toggle };
};
