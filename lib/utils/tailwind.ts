import type { SignalStrength } from '@/lib/types/analysis';

export function getStrengthClasses(strength: SignalStrength): string {
  const classes: Record<SignalStrength, string> = {
    BULLISH: 'bg-bullish-100 text-bullish-700 border-bullish-500',
    STRONG: 'bg-bullish-100 text-bullish-700 border-bullish-500',
    BEARISH: 'bg-bearish-100 text-bearish-700 border-bearish-500',
    WEAK: 'bg-neutral-100 text-neutral-600 border-neutral-400',
    MODERATE: 'bg-amber-100 text-amber-700 border-amber-500',
    NEUTRAL: 'bg-neutral-100 text-neutral-700 border-neutral-500',
  };
  return classes[strength] ?? classes.NEUTRAL;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    FIBONACCI: '#8b5cf6',
    MACD: '#06b6d4',
    RSI: '#f59e0b',
    STOCHASTIC: '#ec4899',
    MA_RIBBON: '#3b82f6',
    MA_POSITION: '#3b82f6',
  };
  return colors[category] ?? '#71717a';
}

export function getConfidenceWidth(confidence: number): string {
  const percent = Math.round(confidence * 100);
  if (percent >= 80) return 'w-full';
  if (percent >= 60) return 'w-4/5';
  if (percent >= 40) return 'w-3/5';
  if (percent >= 20) return 'w-2/5';
  return 'w-1/5';
}

export function getConfidenceStyle(confidence: number): React.CSSProperties {
  return { width: `${Math.round(confidence * 100)}%` };
}
