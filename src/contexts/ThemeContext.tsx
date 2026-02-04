import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'standard' | 'newyear' | 'halloween';

export interface ThemeConfig {
  name: ThemeName;
  particles: 'default' | 'snowflakes' | 'bats';
  accentColor: string;
  decorations: boolean;
}

interface ThemeContextType {
  currentTheme: ThemeName;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeName) => void;
}

const themes: Record<ThemeName, ThemeConfig> = {
  standard: {
    name: 'standard',
    particles: 'default',
    accentColor: '#00d4ff',
    decorations: false,
  },
  newyear: {
    name: 'newyear',
    particles: 'snowflakes',
    accentColor: '#ff4444',
    decorations: true, // snow on buttons, garlands
  },
  halloween: {
    name: 'halloween',
    particles: 'bats',
    accentColor: '#ff6600',
    decorations: true, // cobwebs, pumpkins
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeName) || 'standard';
  });

  const themeConfig = themes[currentTheme];

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    
    // Apply theme accent color to CSS variable
    document.documentElement.style.setProperty('--neon-primary', themeConfig.accentColor);
  }, [currentTheme, themeConfig.accentColor]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeConfig, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
