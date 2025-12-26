'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { BaseChart } from './base-chart';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { Signal } from '@/lib/types/analysis';

interface SignalCategoryPieProps {
  signals: Signal[];
}

export function SignalCategoryPie({ signals }: SignalCategoryPieProps) {
  const data = useMemo(() => {
    const counts = signals.reduce<Record<string, number>>((acc, signal) => {
      acc[signal.category] = (acc[signal.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([category, count]) => ({
        name: formatCategory(category),
        value: count,
        category,
      }))
      .sort((a, b) => b.value - a.value);
  }, [signals]);

  return (
    <BaseChart height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: CHART_COLORS.axis }}
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={CHART_COLORS.categories[entry.category] ?? CHART_COLORS.neutral}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value} signals`, 'Count']} />
      </PieChart>
    </BaseChart>
  );
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ');
}
