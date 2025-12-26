'use client';

import type { Signal } from '@/lib/types/analysis';
import { SignalRadarChart } from './signal-radar-chart';
import { SignalBarChart } from './signal-bar-chart';
import { SignalCategoryPie } from './signal-category-pie';
import { SignalConfidenceGauge } from './signal-confidence-gauge';
import { SignalStrengthHeatmap } from './signal-strength-heatmap';

interface SignalChartFactoryProps {
  signals: Signal[];
  variant?: 'radar' | 'bar' | 'pie' | 'gauge' | 'heatmap' | 'auto';
}

export function SignalChartFactory({
  signals,
  variant = 'auto',
}: SignalChartFactoryProps) {
  if (signals.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No signals to display
      </div>
    );
  }

  if (variant === 'auto') {
    const categories = new Set(signals.map((s) => s.category));
    const hasMultipleCategories = categories.size > 2;
    const hasConfidenceVariance = hasSignificantVariance(
      signals.map((s) => s.confidence)
    );

    if (hasMultipleCategories && signals.length >= 4) {
      return <SignalRadarChart signals={signals} />;
    }
    if (hasConfidenceVariance) {
      return <SignalBarChart signals={signals} />;
    }
    return <SignalCategoryPie signals={signals} />;
  }

  switch (variant) {
    case 'radar':
      return <SignalRadarChart signals={signals} />;
    case 'bar':
      return <SignalBarChart signals={signals} />;
    case 'pie':
      return <SignalCategoryPie signals={signals} />;
    case 'gauge':
      return <SignalConfidenceGauge signals={signals} />;
    case 'heatmap':
      return <SignalStrengthHeatmap signals={signals} />;
    default:
      return <SignalBarChart signals={signals} />;
  }
}

function hasSignificantVariance(values: number[]): boolean {
  if (values.length < 2) return false;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance) > 0.15;
}
