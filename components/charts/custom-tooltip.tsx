'use client';

import type { TooltipProps } from 'recharts';
import { CHART_COLORS } from '@/lib/charts/theme';

interface CustomTooltipProps extends TooltipProps<number, string> {
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
}

export function CustomTooltip({
  active,
  payload,
  label,
  formatValue = (v) => v.toFixed(2),
  formatLabel = (l) => l,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="rounded-lg border bg-white p-3 shadow-lg dark:bg-neutral-900"
      style={{
        borderColor: CHART_COLORS.tooltip.border,
      }}
    >
      <p className="mb-2 font-medium text-sm">{formatLabel(label)}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatValue(entry.value as number)}</span>
        </div>
      ))}
    </div>
  );
}
