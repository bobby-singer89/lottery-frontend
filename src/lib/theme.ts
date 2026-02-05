export type ThemeName = 'default' | 'new-year' | 'halloween';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  particles: string;
  neonColor: string;
  neonColorRgb: string;
  backgroundGradient: string;
  accentGradient: string;
  cardGlow: string;
  buttonGradient: string;
  textGradient: string;
  ringGradient: string;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: 'Weekend Millions',
    particles: '/assets/particles/particles-default.png',
    neonColor: '#a78bfa',
    neonColorRgb: '167, 139, 250',
    backgroundGradient: 'linear-gradient(135deg, #1a0033 0%, #33001a 50%, #0a0a0f 100%)',
    accentGradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
    cardGlow: '0 0 30px rgba(167, 139, 250, 0.3)',
    buttonGradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #f59e0b 100%)',
    textGradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
    ringGradient: 'conic-gradient(from 0deg, #a78bfa, #ec4899, #f59e0b, #a78bfa)',
  },
  'new-year': {
    name: 'new-year',
    displayName: 'New Year Special',
    particles: '/assets/particles/particles-newyear.png',
    neonColor: '#fbbf24',
    neonColorRgb: '251, 191, 36',
    backgroundGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
    accentGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    cardGlow: '0 0 30px rgba(251, 191, 36, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)',
    textGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    ringGradient: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #dc2626, #fbbf24)',
  },
  halloween: {
    name: 'halloween',
    displayName: 'Halloween Special',
    particles: '/assets/particles/particles-halloween.png',
    neonColor: '#f97316',
    neonColorRgb: '249, 115, 22',
    backgroundGradient: 'linear-gradient(135deg, #1a0a00 0%, #2d1b00 50%, #0a0a0f 100%)',
    accentGradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    cardGlow: '0 0 30px rgba(249, 115, 22, 0.4)',
    buttonGradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 50%, #7c2d12 100%)',
    textGradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    ringGradient: 'conic-gradient(from 0deg, #f97316, #dc2626, #7c2d12, #f97316)',
  },
};

// Shared design tokens
export const sharedColors = {
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
  },
};

// Glassmorphism presets
export const glassmorphism = {
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  button: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
};

// Animation configuration
export const animations = {
  durations: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  springs: {
    bouncy: { type: 'spring', stiffness: 300, damping: 20 },
    smooth: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

/**
 * Get seasonal theme based on current date
 */
export function getSeasonalTheme(): ThemeName {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // New Year (December 20 - January 10)
  if ((month === 11 && day >= 20) || (month === 0 && day <= 10)) {
    return 'new-year';
  }

  // Halloween (October 20 - November 5)
  if ((month === 9 && day >= 20) || (month === 10 && day <= 5)) {
    return 'halloween';
  }

  return 'default';
}

/**
 * Apply theme CSS variables to document
 */
export function applyTheme(themeName: ThemeName): void {
  const theme = themes[themeName];
  const root = document.documentElement;

  // Apply CSS variables
  root.style.setProperty('--theme-neon-color', theme.neonColor);
  root.style.setProperty('--theme-neon-color-rgb', theme.neonColorRgb);
  root.style.setProperty('--theme-background-gradient', theme.backgroundGradient);
  root.style.setProperty('--theme-accent-gradient', theme.accentGradient);
  root.style.setProperty('--theme-card-glow', theme.cardGlow);
  root.style.setProperty('--theme-button-gradient', theme.buttonGradient);
  root.style.setProperty('--theme-text-gradient', theme.textGradient);
  root.style.setProperty('--theme-ring-gradient', theme.ringGradient);

  // Apply glassmorphism variables
  root.style.setProperty('--glass-background', sharedColors.glass.background);
  root.style.setProperty('--glass-border', sharedColors.glass.border);
  root.style.setProperty('--glass-hover', sharedColors.glass.hover);

  // Apply text colors
  root.style.setProperty('--text-primary', sharedColors.text.primary);
  root.style.setProperty('--text-secondary', sharedColors.text.secondary);
  root.style.setProperty('--text-muted', sharedColors.text.muted);
}
