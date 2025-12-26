'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import { BaseChart } from './base-chart';
import { CustomTooltip } from './custom-tooltip';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { Signal, SignalStrength } from '@/lib/types/analysis';

interface SignalRadarChartProps {
  signals: Signal[];
}

export function SignalRadarChart({ signals }: SignalRadarChartProps) {
  const data = useMemo(() => {
    const categories = signals.reduce<
      Record<string, { confidence: number; count: number; strength: number }>
    >((acc, signal) => {
      const cat = signal.category;
      if (!acc[cat]) {
        acc[cat] = { confidence: 0, count: 0, strength: 0 };
      }
      acc[cat].confidence += signal.confidence;
      acc[cat].count += 1;
      acc[cat].strength += strengthToNumber(signal.strength);
      return acc;
    }, {});

    return Object.entries(categories).map(([category, data]) => ({
      category: formatCategory(category),
      confidence: Math.round((data.confidence / data.count) * 100),
      strength: Math.round((data.strength / data.count) * 100),
      count: data.count,
    }));
  }, [signals]);

  return (
    <BaseChart height={350}>
      <RadarChart data={data}>
        <PolarGrid stroke={CHART_COLORS.grid} />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: CHART_COLORS.axis }}
        />
        <Radar
          name="Confidence"
          dataKey="confidence"
          stroke={CHART_COLORS.primary}
          fill={CHART_COLORS.primary}
          fillOpacity={0.3}
        />
        <Radar
          name="Strength"
          dataKey="strength"
          stroke={CHART_COLORS.secondary}
          fill={CHART_COLORS.secondary}
          fillOpacity={0.3}
        />
        <Tooltip content={<CustomTooltip formatValue={(v) => `${v}%`} />} />
        <Legend />
      </RadarChart>
    </BaseChart>
  );
}

function strengthToNumber(strength: SignalStrength): number {
  const map: Record<SignalStrength, number> = {
    STRONG: 1,
    BULLISH: 0.8,
    MODERATE: 0.6,
    NEUTRAL: 0.5,
    WEAK: 0.3,
    BEARISH: 0.2,
  };
  return map[strength] ?? 0.5;
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
