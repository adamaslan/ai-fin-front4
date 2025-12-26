'use client';

import { useMemo } from 'react';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { Signal, SignalStrength } from '@/lib/types/analysis';

interface SignalStrengthHeatmapProps {
  signals: Signal[];
}

export function SignalStrengthHeatmap({ signals }: SignalStrengthHeatmapProps) {
  const grid = useMemo(() => {
    const categories = [...new Set(signals.map((s) => s.category))].sort();
    const strengths: SignalStrength[] = [
      'STRONG',
      'BULLISH',
      'MODERATE',
      'NEUTRAL',
      'WEAK',
      'BEARISH',
    ];

    return {
      categories,
      strengths,
      cells: categories.map((cat) => ({
        category: cat,
        values: strengths.map((str) => {
          const matching = signals.filter(
            (s) => s.category === cat && s.strength === str
          );
          return {
            strength: str,
            count: matching.length,
            avgConfidence:
              matching.length > 0
                ? matching.reduce((sum, s) => sum + s.confidence, 0) / matching.length
                : 0,
          };
        }),
      })),
    };
  }, [signals]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium text-muted-foreground">
              Category
            </th>
            {grid.strengths.map((str) => (
              <th
                key={str}
                className="p-2 text-center font-medium text-muted-foreground"
              >
                {str}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.cells.map((row) => (
            <tr key={row.category} className="border-t">
              <td className="p-2 font-medium">{formatCategory(row.category)}</td>
              {row.values.map((cell) => (
                <td key={cell.strength} className="p-1">
                  <div
                    className="mx-auto flex h-10 w-10 items-center justify-center rounded text-xs font-medium"
                    style={{
                      backgroundColor:
                        cell.count > 0
                          ? getHeatColor(cell.avgConfidence, cell.strength)
                          : '#f4f4f5',
                      color: cell.count > 0 ? 'white' : '#a1a1aa',
                    }}
                  >
                    {cell.count > 0 ? cell.count : '-'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getHeatColor(confidence: number, strength: SignalStrength): string {
  const baseColor = CHART_COLORS.strengths[strength] ?? CHART_COLORS.neutral;
  return baseColor;
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ');
}
