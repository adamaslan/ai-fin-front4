'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { BaseChart } from './base-chart';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { Signal } from '@/lib/types/analysis';

interface SignalConfidenceGaugeProps {
  signals: Signal[];
}

export function SignalConfidenceGauge({ signals }: SignalConfidenceGaugeProps) {
  const { avgConfidence, sentiment, color } = useMemo(() => {
    const avg = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const bullish = signals.filter(
      (s) => s.strength === 'BULLISH' || s.strength === 'STRONG'
    ).length;
    const bearish = signals.filter(
      (s) => s.strength === 'BEARISH' || s.strength === 'WEAK'
    ).length;

    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let color = CHART_COLORS.neutral;

    if (bullish > bearish) {
      sentiment = 'bullish';
      color = CHART_COLORS.bullish;
    } else if (bearish > bullish) {
      sentiment = 'bearish';
      color = CHART_COLORS.bearish;
    }

    return { avgConfidence: avg, sentiment, color };
  }, [signals]);

  const gaugeData = [
    { value: avgConfidence * 100 },
    { value: 100 - avgConfidence * 100 },
  ];

  return (
    <div className="flex flex-col items-center">
      <BaseChart height={200}>
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill={CHART_COLORS.grid} />
          </Pie>
        </PieChart>
      </BaseChart>
      <div className="text-center -mt-8">
        <p className="text-3xl font-bold" style={{ color }}>
          {Math.round(avgConfidence * 100)}%
        </p>
        <p className="text-sm text-muted-foreground capitalize">
          {sentiment} ({signals.length} signals)
        </p>
      </div>
    </div>
  );
}
