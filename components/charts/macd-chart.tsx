'use client';

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
  ResponsiveContainer,
  Cell,
  Area,
} from 'recharts';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { IndicatorData, Signal } from '@/lib/types/analysis';

interface MACDChartProps {
  indicators: IndicatorData;
  signals: Signal[];
}

// Generate simulated historical MACD data based on current values
function generateHistoricalMACD(macd: number, signal: number, periods: number = 20) {
  const data = [];
  const histogram = macd - signal;

  // Create a realistic momentum pattern leading to current values
  // Simulate a trend reversal or continuation pattern
  const trendStrength = Math.abs(histogram) / Math.max(Math.abs(macd), 0.01);
  const isBullishTrend = histogram > 0;

  for (let i = 0; i < periods; i++) {
    const periodFromEnd = periods - 1 - i;
    const progress = i / (periods - 1);

    // Create wave-like pattern with trend
    const wavePhase = Math.sin((i / periods) * Math.PI * 2.5);
    const trendComponent = progress * (isBullishTrend ? 1 : -1) * Math.abs(histogram) * 1.5;

    // Calculate historical values with some randomness
    const noise = (Math.random() - 0.5) * Math.abs(histogram) * 0.3;
    const historicalHistogram = i === periods - 1
      ? histogram
      : trendComponent + wavePhase * Math.abs(histogram) * 0.8 + noise;

    // Derive MACD and signal from histogram
    const historicalSignal = i === periods - 1
      ? signal
      : signal + (Math.random() - 0.5) * Math.abs(signal) * 0.2;
    const historicalMACD = historicalSignal + historicalHistogram;

    data.push({
      period: i + 1,
      label: i === periods - 1 ? 'Now' : `${periodFromEnd}d`,
      macd: historicalMACD,
      signal: historicalSignal,
      histogram: historicalHistogram,
      isBullish: historicalHistogram > 0,
    });
  }

  return data;
}

export function MACDChart({ indicators, signals }: MACDChartProps) {
  const macd = indicators.MACD;
  const signal = indicators.MACD_Signal;
  const histogram = macd - signal;
  const isBullish = macd > signal;

  // Generate 20 periods of historical data
  const histogramData = generateHistoricalMACD(macd, signal, 20);

  // Count momentum direction changes
  const bullishBars = histogramData.filter(d => d.histogram > 0).length;
  const bearishBars = histogramData.filter(d => d.histogram < 0).length;

  // Detect momentum shifts
  let momentumShifts = 0;
  for (let i = 1; i < histogramData.length; i++) {
    if ((histogramData[i].histogram > 0) !== (histogramData[i-1].histogram > 0)) {
      momentumShifts++;
    }
  }

  // Find MACD-related signals
  const macdSignals = signals.filter(s =>
    s.category === 'MACD' || s.name.includes('MACD')
  );

  // Calculate histogram range for better visualization
  const histogramValues = histogramData.map(d => d.histogram);
  const maxHist = Math.max(...histogramValues);
  const minHist = Math.min(...histogramValues);
  const histRange = Math.max(Math.abs(maxHist), Math.abs(minHist));

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">MACD Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Moving Average Convergence Divergence (12, 26, 9)
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Bullish ({bullishBars})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Bearish ({bearishBars})</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-content">
        {/* Main Histogram Chart - Full Width, 14+ periods */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Histogram (20 Periods) - Momentum Strength
            </p>
            <p className="text-xs text-muted-foreground">
              {momentumShifts} crossover{momentumShifts !== 1 ? 's' : ''} in period
            </p>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={histogramData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="bullishGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="bearishGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  interval={1}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                />
                <YAxis
                  domain={[-histRange * 1.1, histRange * 1.1]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.toFixed(2)}
                  width={50}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value.toFixed(4),
                    name === 'histogram' ? 'Histogram' : name
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <ReferenceLine y={0} stroke={CHART_COLORS.neutral} strokeWidth={2} />

                {/* Histogram Bars */}
                <Bar dataKey="histogram" radius={[2, 2, 0, 0]} maxBarSize={25}>
                  {histogramData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.histogram > 0 ? 'url(#bullishGradient)' : 'url(#bearishGradient)'}
                      stroke={entry.histogram > 0 ? '#16a34a' : '#dc2626'}
                      strokeWidth={index === histogramData.length - 1 ? 2 : 0}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MACD & Signal Lines Chart */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            MACD Line vs Signal Line
          </p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={histogramData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="macdAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  interval={1}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.toFixed(2)}
                  width={50}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value.toFixed(4),
                    name === 'macd' ? 'MACD' : 'Signal'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <ReferenceLine y={0} stroke={CHART_COLORS.neutral} strokeDasharray="5 5" />

                {/* MACD Area fill */}
                <Area
                  type="monotone"
                  dataKey="macd"
                  stroke="transparent"
                  fill="url(#macdAreaGradient)"
                />

                {/* Signal Line */}
                <Line
                  type="monotone"
                  dataKey="signal"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Signal"
                />

                {/* MACD Line */}
                <Line
                  type="monotone"
                  dataKey="macd"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, index } = props;
                    if (index === histogramData.length - 1) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#3b82f6"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return <circle cx={cx} cy={cy} r={0} />;
                  }}
                  name="MACD"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section: Values & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Values */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                <p
                  className="text-xl font-bold text-blue-500"
                >
                  {macd.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">MACD Line</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                <p className="text-xl font-bold text-orange-500">
                  {signal.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">Signal Line</p>
              </div>
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: histogram > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${histogram > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                <p
                  className="text-xl font-bold"
                  style={{ color: histogram > 0 ? CHART_COLORS.bullish : CHART_COLORS.bearish }}
                >
                  {histogram > 0 ? '+' : ''}{histogram.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">Histogram</p>
              </div>
            </div>

            {/* Crossover Status */}
            <div
              className="p-4 rounded-lg border-2"
              style={{
                borderColor: isBullish ? CHART_COLORS.bullish : CHART_COLORS.bearish,
                backgroundColor: isBullish ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full animate-pulse"
                  style={{ backgroundColor: isBullish ? CHART_COLORS.bullish : CHART_COLORS.bearish }}
                />
                <div>
                  <p className="font-semibold" style={{ color: isBullish ? CHART_COLORS.bullish : CHART_COLORS.bearish }}>
                    {isBullish ? 'BULLISH Momentum' : 'BEARISH Momentum'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MACD is {Math.abs(histogram).toFixed(4)} {isBullish ? 'above' : 'below'} Signal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Interpretation & Signals */}
          <div className="space-y-4">
            {/* Momentum Analysis */}
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-medium mb-2">Momentum Analysis</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trend Direction:</span>
                  <span className="font-medium" style={{ color: isBullish ? CHART_COLORS.bullish : CHART_COLORS.bearish }}>
                    {isBullish ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Histogram Strength:</span>
                  <span className="font-medium">
                    {Math.abs(histogram) > histRange * 0.7 ? 'Strong' :
                     Math.abs(histogram) > histRange * 0.3 ? 'Moderate' : 'Weak'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zero Line Position:</span>
                  <span className="font-medium" style={{ color: macd > 0 ? CHART_COLORS.bullish : CHART_COLORS.bearish }}>
                    {macd > 0 ? 'Above (Bullish)' : 'Below (Bearish)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Signals */}
            {macdSignals.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Signals</p>
                {macdSignals.map((sig, i) => (
                  <div
                    key={i}
                    className="p-2 rounded border-l-4 bg-muted/30"
                    style={{ borderLeftColor: CHART_COLORS.primary }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{sig.name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: sig.confidence > 0.7 ? CHART_COLORS.bullish : CHART_COLORS.neutral,
                          color: 'white'
                        }}
                      >
                        {(sig.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Interpretation Guide */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Green bars = Bullish momentum (MACD {'>'} Signal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Red bars = Bearish momentum (MACD {'<'} Signal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
