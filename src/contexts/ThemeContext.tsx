import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeName, ThemeConfig, themes, getSeasonalTheme, applyTheme } from '../lib/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme') as ThemeName;
    return saved && themes[saved] ? saved : getSeasonalTheme();
  });

  const theme = themes[themeName];

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', themeName);
  }, [themeName, theme]);

  const setTheme = (name: ThemeName) => setThemeName(name);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
