export const themes = {
  light: {
    name: 'Light',
    chartColors: ['#2563eb', '#16a34a', '#f97316', '#c026d3', '#7c3aed', '#d97706', '#0d9488', '#4f46e5', '#be185d'],
  },
  dark: {
    name: 'Dark',
    chartColors: ['#3b82f6', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#f59e0b', '#14b8a6', '#6366f1', '#d946ef'],
  },
  corporate: {
    name: 'Corporate',
    chartColors: ['#0369a1', '#52525b', '#059669', '#9333ea', '#6d28d9', '#ea580c', '#0d9488', '#4338ca', '#be185d'],
  }
};

export type ThemeName = keyof typeof themes;
