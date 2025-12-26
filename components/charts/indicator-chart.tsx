'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { BaseChart } from './base-chart';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { IndicatorData } from '@/lib/types/analysis';

interface IndicatorChartProps {
  indicators: IndicatorData;
  showMAs?: boolean;
  showMACD?: boolean;
}

export function IndicatorChart({
  indicators,
  showMAs = true,
  showMACD = true,
}: IndicatorChartProps) {
  const maData = useMemo(() => {
    if (!showMAs) return [];

    const smaKeys = Object.keys(indicators).filter((k) => k.startsWith('SMA_'));
    return smaKeys
      .map((key) => ({
        name: key.replace('SMA_', 'SMA '),
        value: indicators[key] as number,
        period: parseInt(key.replace('SMA_', '')),
      }))
      .sort((a, b) => a.period - b.period);
  }, [indicators, showMAs]);

  const priceVsMA = useMemo(() => {
    const price = indicators.Current_Price;
    return maData.map((ma) => ({
      ...ma,
      diff: (((price - ma.value) / ma.value) * 100).toFixed(2),
      aboveMA: price > ma.value,
    }));
  }, [indicators.Current_Price, maData]);

  return (
    <div className="space-y-6">
      {showMAs && maData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-medium">Price vs Moving Averages</h3>
          </div>
          <div className="card-content">
            <BaseChart height={250}>
              <ComposedChart data={priceVsMA}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="price"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                />
                <YAxis
                  yAxisId="diff"
                  orientation="right"
                  domain={[-10, 10]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip />
                <Legend />
                <ReferenceLine
                  yAxisId="price"
                  y={indicators.Current_Price}
                  stroke={CHART_COLORS.primary}
                  strokeDasharray="5 5"
                  label={{
                    value: `Price: $${indicators.Current_Price.toFixed(2)}`,
                    position: 'right',
                  }}
                />
                <Bar
                  yAxisId="price"
                  dataKey="value"
                  fill={CHART_COLORS.ma}
                  name="MA Value"
                />
                <Line
                  yAxisId="diff"
                  type="monotone"
                  dataKey="diff"
                  stroke={CHART_COLORS.accent}
                  name="% from Price"
                  dot={{ fill: CHART_COLORS.accent }}
                />
              </ComposedChart>
            </BaseChart>
          </div>
        </div>
      )}

      {showMACD && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-medium">MACD Analysis</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color:
                      indicators.MACD > 0
                        ? CHART_COLORS.bullish
                        : CHART_COLORS.bearish,
                  }}
                >
                  {indicators.MACD.toFixed(4)}
                </p>
                <p className="text-sm text-muted-foreground">MACD</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {indicators.MACD_Signal.toFixed(4)}
                </p>
                <p className="text-sm text-muted-foreground">Signal</p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color:
                      indicators.MACD > indicators.MACD_Signal
                        ? CHART_COLORS.bullish
                        : CHART_COLORS.bearish,
                  }}
                >
                  {(indicators.MACD - indicators.MACD_Signal).toFixed(4)}
                </p>
                <p className="text-sm text-muted-foreground">Histogram</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    indicators.MACD > indicators.MACD_Signal
                      ? CHART_COLORS.bullish
                      : CHART_COLORS.bearish,
                }}
              />
              <span className="text-sm font-medium">
                {indicators.MACD > indicators.MACD_Signal
                  ? 'Bullish Crossover'
                  : 'Bearish Crossover'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
