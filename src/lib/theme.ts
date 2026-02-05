export type ThemeName = 'default' | 'new-year' | 'halloween';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
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
    neonColor: '#a78bfa',
    neonColorRgb: '167, 139, 250',
    backgroundGradient: 'linear-gradient(135deg, #1a0033 0%, #33001a 50%, #0a0a0f 100%)',
    accentGradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
    cardGlow: '0 0 40px rgba(167, 139, 250, 0.3)',
    buttonGradient: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
    textGradient: 'linear-gradient(to right, #a78bfa, #ec4899)',
    ringGradient: 'conic-gradient(from 0deg, #a78bfa, #ec4899, #a78bfa)',
  },
  'new-year': {
    name: 'new-year',
    displayName: 'New Year Special',
    neonColor: '#fbbf24',
    neonColorRgb: '251, 191, 36',
    backgroundGradient: 'linear-gradient(135deg, #1a1a00 0%, #332600 50%, #0a0a0f 100%)',
    accentGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    cardGlow: '0 0 40px rgba(251, 191, 36, 0.3)',
    buttonGradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    textGradient: 'linear-gradient(to right, #fbbf24, #f59e0b)',
    ringGradient: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #fbbf24)',
  },
  halloween: {
    name: 'halloween',
    displayName: 'Halloween Special',
    neonColor: '#f97316',
    neonColorRgb: '249, 115, 22',
    backgroundGradient: 'linear-gradient(135deg, #1a0a00 0%, #330d00 50%, #0a0a0f 100%)',
    accentGradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    cardGlow: '0 0 40px rgba(249, 115, 22, 0.3)',
    buttonGradient: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
    textGradient: 'linear-gradient(to right, #f97316, #dc2626)',
    ringGradient: 'conic-gradient(from 0deg, #f97316, #dc2626, #f97316)',
  },
};

export function getSeasonalTheme(): ThemeName {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // New Year: Dec 20 - Jan 10
  if ((month === 12 && day >= 20) || (month === 1 && day <= 10)) {
    return 'new-year';
  }
  // Halloween: Oct 20 - Nov 5
  if ((month === 10 && day >= 20) || (month === 11 && day <= 5)) {
    return 'halloween';
  }
  return 'default';
}

export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--theme-neon-color', theme.neonColor);
  root.style.setProperty('--theme-neon-rgb', theme.neonColorRgb);
  root.style.setProperty('--theme-background', theme.backgroundGradient);
  root.style.setProperty('--theme-accent', theme.accentGradient);
  root.style.setProperty('--theme-card-glow', theme.cardGlow);
  root.style.setProperty('--theme-button', theme.buttonGradient);
  root.style.setProperty('--theme-text-gradient', theme.textGradient);
  root.style.setProperty('--theme-ring', theme.ringGradient);
}
