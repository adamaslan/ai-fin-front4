'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { BaseChart } from './base-chart';
import { CustomTooltip } from './custom-tooltip';
import { CHART_COLORS, CHART_CONFIG } from '@/lib/charts/theme';
import type { Signal } from '@/lib/types/analysis';

interface SignalBarChartProps {
  signals: Signal[];
  sortBy?: 'confidence' | 'value' | 'category';
}

export function SignalBarChart({ signals, sortBy = 'confidence' }: SignalBarChartProps) {
  const data = useMemo(() => {
    const sorted = [...signals].sort((a, b) => {
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      if (sortBy === 'value') return b.value - a.value;
      return a.category.localeCompare(b.category);
    });

    return sorted.map((signal) => ({
      name: truncate(signal.name, 20),
      fullName: signal.name,
      confidence: Math.round(signal.confidence * 100),
      category: signal.category,
      strength: signal.strength,
      value: signal.value,
    }));
  }, [signals, sortBy]);

  const avgConfidence = useMemo(() => {
    return Math.round(
      (signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length) * 100
    );
  }, [signals]);

  return (
    <BaseChart height={Math.max(300, signals.length * 40)}>
      <BarChart data={data} layout="vertical" margin={CHART_CONFIG.margin}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.grid}
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
        />
        <Tooltip
          content={
            <CustomTooltip
              formatValue={(v) => `${v}%`}
              formatLabel={(label) =>
                data.find((d) => d.name === label)?.fullName ?? label
              }
            />
          }
        />
        <ReferenceLine
          x={avgConfidence}
          stroke={CHART_COLORS.neutral}
          strokeDasharray="5 5"
          label={{ value: 'Avg', position: 'top', fontSize: 10 }}
        />
        <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={CHART_COLORS.categories[entry.category] ?? CHART_COLORS.neutral}
            />
          ))}
        </Bar>
      </BarChart>
    </BaseChart>
  );
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '...' : str;
}
