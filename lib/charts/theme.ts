export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#06b6d4',

  bullish: '#22c55e',
  bearish: '#ef4444',
  neutral: '#71717a',

  categories: {
    FIBONACCI: '#8b5cf6',
    MACD: '#06b6d4',
    RSI: '#f59e0b',
    STOCHASTIC: '#ec4899',
    MA_RIBBON: '#3b82f6',
    MA_POSITION: '#10b981',
  } as Record<string, string>,

  strengths: {
    BULLISH: '#22c55e',
    STRONG: '#16a34a',
    BEARISH: '#ef4444',
    WEAK: '#9ca3af',
    MODERATE: '#f59e0b',
    NEUTRAL: '#71717a',
  } as Record<string, string>,

  grid: '#e5e7eb',
  axis: '#6b7280',
  tooltip: {
    bg: '#ffffff',
    border: '#e5e7eb',
    text: '#1f2937',
  },

  ma: '#3b82f6',
};

export const CHART_CONFIG = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  fontSize: 12,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};
