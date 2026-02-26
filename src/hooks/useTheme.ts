import { useState, useEffect, useCallback } from 'react';

interface ThemeState {
  readonly theme: 'dark' | 'light';
  readonly toggleTheme: () => void;
}

export function useTheme(): ThemeState {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('scramble-theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('scramble-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback((): void => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
