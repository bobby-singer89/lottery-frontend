/**
 * Design Tokens Configuration
 * Generated from Figma designs for Weekend Millions
 * 
 * This file contains all design tokens extracted from Figma:
 * - Colors
 * - Typography
 * - Spacing
 * - Shadows
 * - Animations
 * 
 * Usage:
 * import { DESIGN_TOKENS } from '@/config/design-tokens';
 */

export const DESIGN_TOKENS = {
  /**
   * Color System
   */
  colors: {
    // Brand Colors
    brand: {
      purple: {
        main: '#8b5cf6',      // purple-600
        light: '#a78bfa',     // purple-400
        dark: '#7c3aed',      // purple-700
        glow: 'rgba(139, 92, 246, 0.6)',
      },
      pink: {
        main: '#ec4899',      // pink-500
        light: '#f472b6',     // pink-400
        dark: '#db2777',      // pink-600
      },
      gradient: {
        primary: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        purple: 'linear-gradient(135deg, #8b5cf680, #8b5cf640)',
        greenTeal: 'linear-gradient(to right, #22c55e, #06b6d4)',
      },
    },

    // Lottery Category Colors
    lottery: {
      draw: {
        purple: '#8b5cf6',
        pink: '#ec4899',
        yellow: '#eab308',
        green: '#22c55e',
        cyan: '#06b6d4',
      },
      keno: {
        purple: '#a78bfa',
        pink: '#f472b6',
        cyan: '#38bdf8',
        green: '#4ade80',
        yellow: '#fbbf24',
      },
      momentum: {
        rose: '#f43f5e',
        purple: '#8b5cf6',
        cyan: '#06b6d4',
        green: '#22c55e',
        yellow: '#eab308',
      },
    },

    // Background Colors
    background: {
      dark: '#000000',
      darkPurple: 'rgb(88, 28, 135)', // purple-950
      glass: 'rgba(0, 0, 0, 0.4)',
      glassLight: 'rgba(0, 0, 0, 0.5)',
      gradient: 'linear-gradient(to bottom, #000000, rgb(88, 28, 135), #000000)',
    },

    // Text Colors
    text: {
      white: '#ffffff',
      gray: {
        100: 'rgba(255, 255, 255, 0.9)',
        200: 'rgba(255, 255, 255, 0.8)',
        300: 'rgba(255, 255, 255, 0.7)',
        400: 'rgba(255, 255, 255, 0.4)',
      },
      purple: {
        light: '#c4b5fd',     // purple-300
        main: '#a78bfa',      // purple-400
      },
    },

    // Border Colors
    border: {
      white10: 'rgba(255, 255, 255, 0.1)',
      white20: 'rgba(255, 255, 255, 0.2)',
      white30: 'rgba(255, 255, 255, 0.3)',
    },

    // Currency Colors
    currency: {
      ton: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        gradient: 'linear-gradient(to right, #8b5cf6, #ec4899)',
      },
      usdt: {
        primary: '#22c55e',
        secondary: '#06b6d4',
        gradient: 'linear-gradient(to right, #22c55e, #06b6d4)',
      },
    },
  },

  /**
   * Typography System
   */
  typography: {
    // Font Families
    fontFamily: {
      base: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    // Font Sizes
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },

    // Font Weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    // Line Heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  /**
   * Spacing System
   */
  spacing: {
    // Component Spacing
    component: {
      headerHeight: '4rem',       // 64px
      footerHeight: '5rem',       // 80px
      cardGap: '5rem',           // 80px
      carouselHeight: '28.125rem', // 450px
    },

    // Padding
    padding: {
      xs: '0.25rem',   // 4px
      sm: '0.5rem',    // 8px
      md: '0.75rem',   // 12px
      lg: '1rem',      // 16px
      xl: '1.5rem',    // 24px
      '2xl': '2rem',   // 32px
    },

    // Gaps
    gap: {
      xs: '0.5rem',    // 8px
      sm: '0.75rem',   // 12px
      md: '1rem',      // 16px
      lg: '2rem',      // 32px
      xl: '3rem',      // 48px
    },

    // Margins
    margin: {
      section: '2rem',    // 32px mobile
      sectionLg: '4rem',  // 64px desktop
    },
  },

  /**
   * Border Radius
   */
  borderRadius: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    full: '9999px',
  },

  /**
   * Shadows
   */
  shadows: {
    // Neon Glow Shadows
    neon: (color: string) => `0 0 60px ${color}60, 0 0 100px ${color}30, inset 0 0 60px ${color}10`,
    neonLight: (color: string) => `0 0 30px ${color}30`,
    neonHeavy: (color: string) => `0 0 60px ${color}60, 0 0 100px ${color}30`,

    // Standard Shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Brand Shadows
    purple: '0 0 60px rgba(139, 92, 246, 0.5)',
    pink: '0 0 60px rgba(236, 72, 153, 0.5)',
  },

  /**
   * Animation
   */
  animation: {
    // Duration
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
    },

    // Easing Functions
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },

    // Framer Motion Variants
    spring: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },

  /**
   * Breakpoints (for responsive design)
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Z-Index Scale
   */
  zIndex: {
    background: 0,
    content: 10,
    header: 50,
    footer: 50,
    modal: 100,
    tooltip: 200,
  },

  /**
   * Backdrop Blur
   */
  backdropBlur: {
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(12px)',
    xl: 'blur(16px)',
  },
};

/**
 * Helper Functions
 */

// Get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Get gradient background
export const getGradientBg = (color1: string, color2: string, angle = 135): string => {
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

// Get neon glow for specific color
export const getNeonGlow = (color: string, intensity: 'light' | 'normal' | 'heavy' = 'normal'): string => {
  switch (intensity) {
    case 'light':
      return DESIGN_TOKENS.shadows.neonLight(color);
    case 'heavy':
      return DESIGN_TOKENS.shadows.neonHeavy(color);
    default:
      return DESIGN_TOKENS.shadows.neon(color);
  }
};

/**
 * Type Exports
 */
export type DesignTokens = typeof DESIGN_TOKENS;
export type ColorKey = keyof typeof DESIGN_TOKENS.colors;
export type SpacingKey = keyof typeof DESIGN_TOKENS.spacing;

export default DESIGN_TOKENS;
