'use client';

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { IndicatorData, Signal } from '@/lib/types/analysis';

interface CrossoverChartProps {
  indicators: IndicatorData;
  signals: Signal[];
}

export function CrossoverChart({ indicators, signals }: CrossoverChartProps) {
  // Group signals by category for crossover analysis
  const rsiSignals = signals.filter(s => s.category === 'RSI');
  const stochSignals = signals.filter(s => s.category === 'STOCHASTIC');
  const maSignals = signals.filter(s => s.category === 'MA_POSITION' || s.category === 'MA_RIBBON');

  // RSI visualization data (0-100 scale)
  const rsiValue = signals.find(s => s.indicator_name === 'RSI')?.value || 50;
  const rsiData = [
    { x: 1, value: 50 },
    { x: 2, value: 45 },
    { x: 3, value: rsiValue * 0.8 },
    { x: 4, value: rsiValue * 0.9 },
    { x: 5, value: rsiValue },
  ];

  // Stochastic visualization data
  const stochValue = signals.find(s => s.indicator_name === 'Stochastic')?.value || 50;
  const stochData = [
    { x: 1, k: 50, d: 55 },
    { x: 2, k: 60, d: 58 },
    { x: 3, k: stochValue * 0.7, d: stochValue * 0.75 },
    { x: 4, k: stochValue * 0.85, d: stochValue * 0.88 },
    { x: 5, k: stochValue, d: stochValue * 0.95 },
  ];

  // MA Position visualization
  const price = indicators.Current_Price;
  const sma20 = indicators.SMA_20;
  const sma50 = indicators.SMA_50;
  const sma200 = indicators.SMA_200;

  const maData = [
    { name: 'SMA 20', value: sma20, diff: ((price - sma20) / sma20 * 100) },
    { name: 'SMA 50', value: sma50, diff: ((price - sma50) / sma50 * 100) },
    { name: 'SMA 200', value: sma200, diff: ((price - sma200) / sma200 * 100) },
  ];

  const allAboveMA = price > sma20 && price > sma50 && price > sma200;
  const allBelowMA = price < sma20 && price < sma50 && price < sma200;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-medium">Signal Crossovers & Momentum</h3>
        <p className="text-sm text-muted-foreground">
          RSI, Stochastic, and Moving Average analysis
        </p>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* RSI Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">RSI (14)</p>
              <span
                className="text-lg font-bold"
                style={{
                  color: rsiValue > 70 ? CHART_COLORS.bearish :
                    rsiValue < 30 ? CHART_COLORS.bullish :
                      CHART_COLORS.neutral
                }}
              >
                {rsiValue.toFixed(1)}
              </span>
            </div>

            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rsiData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.categories.RSI} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.categories.RSI} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide />
                  <XAxis hide />
                  <ReferenceLine y={70} stroke={CHART_COLORS.bearish} strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke={CHART_COLORS.bullish} strokeDasharray="3 3" />
                  <ReferenceLine y={50} stroke={CHART_COLORS.neutral} strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.categories.RSI}
                    fill="url(#rsiGradient)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* RSI Zones */}
            <div className="flex justify-between text-xs">
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-500">Oversold &lt;30</span>
              <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-500">Neutral</span>
              <span className="px-2 py-1 rounded bg-red-500/20 text-red-500">Overbought &gt;70</span>
            </div>

            {rsiSignals.map((sig, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 text-xs">
                <span className="font-medium">{sig.name}</span>
                <p className="text-muted-foreground mt-1">{sig.description}</p>
              </div>
            ))}
          </div>

          {/* Stochastic Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Stochastic</p>
              <span
                className="text-lg font-bold"
                style={{
                  color: stochValue > 80 ? CHART_COLORS.bearish :
                    stochValue < 20 ? CHART_COLORS.bullish :
                      CHART_COLORS.neutral
                }}
              >
                {stochValue.toFixed(1)}
              </span>
            </div>

            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stochData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="stochGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.categories.STOCHASTIC} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.categories.STOCHASTIC} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide />
                  <XAxis hide />
                  <ReferenceLine y={80} stroke={CHART_COLORS.bearish} strokeDasharray="3 3" />
                  <ReferenceLine y={20} stroke={CHART_COLORS.bullish} strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="k"
                    stroke={CHART_COLORS.categories.STOCHASTIC}
                    fill="url(#stochGradient)"
                    strokeWidth={2}
                    name="%K"
                  />
                  <Line
                    type="monotone"
                    dataKey="d"
                    stroke={CHART_COLORS.bearish}
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="%D"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Stochastic Zones */}
            <div className="flex justify-between text-xs">
              <span className="px-2 py-1 rounded bg-green-500/20 text-green-500">Oversold &lt;20</span>
              <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-500">Neutral</span>
              <span className="px-2 py-1 rounded bg-red-500/20 text-red-500">Overbought &gt;80</span>
            </div>

            {stochSignals.map((sig, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 text-xs">
                <span className="font-medium">{sig.name}</span>
                <p className="text-muted-foreground mt-1">{sig.description}</p>
              </div>
            ))}
          </div>

          {/* MA Position Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">MA Position</p>
              <span
                className="text-lg font-bold"
                style={{
                  color: allAboveMA ? CHART_COLORS.bullish :
                    allBelowMA ? CHART_COLORS.bearish :
                      CHART_COLORS.neutral
                }}
              >
                {allAboveMA ? 'ABOVE ALL' : allBelowMA ? 'BELOW ALL' : 'MIXED'}
              </span>
            </div>

            {/* MA Visual Ladder */}
            <div className="relative h-[100px] flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {maData.map((ma, i) => (
                  <div
                    key={ma.name}
                    className="flex items-center justify-between px-2"
                  >
                    <span className="text-xs">{ma.name}</span>
                    <div className="flex-1 mx-2 relative h-1 bg-muted rounded">
                      <div
                        className="absolute h-full rounded"
                        style={{
                          width: `${Math.min(Math.abs(ma.diff) * 5, 100)}%`,
                          backgroundColor: ma.diff > 0 ? CHART_COLORS.bullish : CHART_COLORS.bearish,
                          left: ma.diff > 0 ? '50%' : `${50 - Math.min(Math.abs(ma.diff) * 5, 50)}%`,
                        }}
                      />
                      <div className="absolute left-1/2 w-0.5 h-3 -top-1 bg-muted-foreground" />
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: ma.diff > 0 ? CHART_COLORS.bullish : CHART_COLORS.bearish }}
                    >
                      {ma.diff > 0 ? '+' : ''}{ma.diff.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price vs MAs */}
            <div className="p-2 rounded bg-muted/50">
              <div className="flex items-center gap-2 text-xs">
                <span>Price:</span>
                <span className="font-bold">${price.toFixed(2)}</span>
                <span className="text-muted-foreground">vs</span>
                <span>SMA20: ${sma20.toFixed(2)}</span>
              </div>
            </div>

            {maSignals.map((sig, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 text-xs">
                <span className="font-medium">{sig.name}</span>
                <p className="text-muted-foreground mt-1">{sig.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
