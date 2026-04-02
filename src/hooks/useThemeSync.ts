import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

/**
 * Subscribes to the Zustand theme store and synchronises the active theme
 * with the `data-theme` attribute on `<html>`.  CSS variable overrides in
 * themes.css use `[data-theme='light']` to switch palettes.
 *
 * Call this hook once at the application root (e.g. inside <App /> or a
 * top-level layout component).  It has no return value.
 */
export function useThemeSync(): void {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
