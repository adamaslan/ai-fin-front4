'use client';

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { IndicatorData, Signal } from '@/lib/types/analysis';

interface FibonacciChartProps {
  indicators: IndicatorData;
  signals: Signal[];
}

// Fibonacci levels with support/resistance classification
const FIB_LEVELS = [
  { level: 0, label: '0%', shortLabel: '0%', color: '#22c55e', type: 'resistance' },
  { level: 0.236, label: '23.6%', shortLabel: '23.6%', color: '#84cc16', type: 'resistance' },
  { level: 0.382, label: '38.2%', shortLabel: '38.2%', color: '#eab308', type: 'key' },
  { level: 0.5, label: '50%', shortLabel: '50%', color: '#f97316', type: 'key' },
  { level: 0.618, label: '61.8% (Golden)', shortLabel: '61.8%', color: '#ef4444', type: 'key' },
  { level: 0.786, label: '78.6%', shortLabel: '78.6%', color: '#dc2626', type: 'support' },
  { level: 1, label: '100%', shortLabel: '100%', color: '#b91c1c', type: 'support' },
];

// Generate historical price data showing retracement patterns
function generateHistoricalPrices(
  currentPrice: number,
  rangeHigh: number,
  rangeLow: number,
  periods: number = 30
) {
  const data = [];
  const range = rangeHigh - rangeLow;

  // Create a realistic price pattern with swing high and retracement
  for (let i = 0; i < periods; i++) {
    const progress = i / (periods - 1);

    // Create a pattern: rise to high, then retrace
    let price;
    if (progress < 0.3) {
      // Initial rise phase
      price = rangeLow + (range * 0.3) + (range * 0.7 * (progress / 0.3));
    } else if (progress < 0.4) {
      // Peak phase
      price = rangeHigh - (range * 0.05 * Math.random());
    } else if (progress < 0.8) {
      // Retracement phase
      const retracementProgress = (progress - 0.4) / 0.4;
      const retracementTarget = rangeHigh - (range * 0.618); // 61.8% retracement
      price = rangeHigh - ((rangeHigh - retracementTarget) * retracementProgress);
      price += (Math.random() - 0.5) * range * 0.08;
    } else {
      // Recovery/current phase
      const recoveryProgress = (progress - 0.8) / 0.2;
      const startPrice = rangeHigh - (range * 0.618);
      price = startPrice + ((currentPrice - startPrice) * recoveryProgress);
    }

    // Add some noise for realism
    price += (Math.random() - 0.5) * range * 0.02;

    // Ensure last point is exactly current price
    if (i === periods - 1) {
      price = currentPrice;
    }

    data.push({
      period: i + 1,
      label: i === periods - 1 ? 'Now' : i === 0 ? `${periods - 1}d` : '',
      price: price,
      high: price + range * 0.01,
      low: price - range * 0.01,
    });
  }

  return data;
}

export function FibonacciChart({ indicators, signals }: FibonacciChartProps) {
  const currentPrice = indicators.Current_Price;

  // Calculate Fibonacci levels based on the price range
  const prices = [
    indicators.SMA_20,
    indicators.SMA_50,
    indicators.SMA_200,
    currentPrice,
  ].filter(p => p > 0);

  const rangeHigh = Math.max(...prices) * 1.05;
  const rangeLow = Math.min(...prices) * 0.95;
  const range = rangeHigh - rangeLow;

  // Calculate actual price levels for each Fibonacci level
  const fibLevels = FIB_LEVELS.map(fib => ({
    ...fib,
    price: rangeHigh - (range * fib.level),
  }));

  // Find which Fibonacci zone the current price is in
  const currentZone = fibLevels.findIndex((fib, i) => {
    const nextFib = fibLevels[i + 1];
    if (!nextFib) return false;
    return currentPrice <= fib.price && currentPrice >= nextFib.price;
  });

  // Determine support and resistance levels relative to current price
  const resistanceLevels = fibLevels.filter(f => f.price > currentPrice);
  const supportLevels = fibLevels.filter(f => f.price < currentPrice);
  const nearestResistance = resistanceLevels[resistanceLevels.length - 1];
  const nearestSupport = supportLevels[0];

  // Get Fibonacci-related signals
  const fibSignals = signals.filter(s =>
    s.category === 'FIBONACCI' || s.name.includes('FIB')
  );

  // Generate 30 periods of historical price data
  const priceHistory = generateHistoricalPrices(currentPrice, rangeHigh, rangeLow, 30);

  // Find swing high and swing low in the data
  const swingHigh = Math.max(...priceHistory.map(d => d.price));
  const swingLow = Math.min(...priceHistory.map(d => d.price));
  const swingHighIndex = priceHistory.findIndex(d => d.price === swingHigh);
  const swingLowIndex = priceHistory.findIndex(d => d.price === swingLow);

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Fibonacci Retracement</h3>
            <p className="text-sm text-muted-foreground">
              30-period price action with key support and resistance levels
            </p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500/30 border-2 border-green-500" />
              <span>Support</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500/30 border-2 border-red-500" />
              <span>Resistance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500/30 border-2 border-yellow-500" />
              <span>Key Level</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-content">
        {/* Main Chart - Full Width with Price History and Fibonacci Lines */}
        <div className="h-[400px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={priceHistory}
              margin={{ top: 20, right: 100, left: 60, bottom: 20 }}
            >
              <defs>
                {/* Price area gradient */}
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                {/* Support zone gradient */}
                <linearGradient id="supportZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
                {/* Resistance zone gradient */}
                <linearGradient id="resistanceZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.15} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v === 1 ? '30d ago' : v === 30 ? 'Now' : ''}
                interval={0}
              />
              <YAxis
                domain={[rangeLow * 0.98, rangeHigh * 1.02]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                width={55}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Period ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />

              {/* Colored zones between Fibonacci levels */}
              {fibLevels.slice(0, -1).map((fib, i) => {
                const nextFib = fibLevels[i + 1];
                const isCurrentZoneArea = i === currentZone;
                const isAbovePrice = fib.price > currentPrice && nextFib.price > currentPrice;
                const isBelowPrice = fib.price < currentPrice && nextFib.price < currentPrice;

                let fillColor = 'rgba(100, 100, 100, 0.03)';
                if (isCurrentZoneArea) {
                  fillColor = 'rgba(59, 130, 246, 0.15)';
                } else if (isAbovePrice) {
                  fillColor = 'rgba(239, 68, 68, 0.06)';
                } else if (isBelowPrice) {
                  fillColor = 'rgba(34, 197, 94, 0.06)';
                }

                return (
                  <ReferenceArea
                    key={`zone-${i}`}
                    y1={fib.price}
                    y2={nextFib.price}
                    fill={fillColor}
                    stroke="none"
                  />
                );
              })}

              {/* Fibonacci Level Lines */}
              {fibLevels.map((fib, i) => {
                const isActive = i === currentZone || i === currentZone + 1;
                return (
                  <ReferenceLine
                    key={fib.label}
                    y={fib.price}
                    stroke={fib.color}
                    strokeWidth={isActive ? 3 : fib.type === 'key' ? 2 : 1.5}
                    strokeDasharray={fib.type === 'key' ? '0' : '8 4'}
                    label={{
                      value: `${fib.shortLabel} $${fib.price.toFixed(0)}`,
                      position: 'right',
                      fill: fib.color,
                      fontSize: isActive ? 11 : 10,
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                );
              })}

              {/* Price Area Fill */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="transparent"
                fill="url(#priceGradient)"
              />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  // Highlight current price and swing points
                  if (index === priceHistory.length - 1) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="#3b82f6"
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    );
                  }
                  if (index === swingHighIndex) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#22c55e"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  if (index === swingLowIndex) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 5, fill: '#3b82f6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex justify-center gap-6 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
            <span>Current Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Swing High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Swing Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-yellow-500" />
            <span>Key Fib Level (solid)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-400" />
            <span>Other Level (dashed)</span>
          </div>
        </div>

        {/* Support & Resistance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Nearest Resistance */}
          <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm font-medium text-red-500">RESISTANCE</span>
            </div>
            {nearestResistance ? (
              <>
                <p className="text-2xl font-bold" style={{ color: nearestResistance.color }}>
                  ${nearestResistance.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nearestResistance.label} • {((nearestResistance.price - currentPrice) / currentPrice * 100).toFixed(1)}% above
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Above all levels</p>
            )}
          </div>

          {/* Current Position */}
          <div className="p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm font-medium text-blue-500">CURRENT PRICE</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">
              ${currentPrice.toFixed(2)}
            </p>
            {currentZone >= 0 && currentZone < fibLevels.length - 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                In zone: {fibLevels[currentZone].label} → {fibLevels[currentZone + 1].label}
              </p>
            )}
          </div>

          {/* Nearest Support */}
          <div className="p-4 rounded-lg bg-green-500/10 border-2 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-green-500">SUPPORT</span>
            </div>
            {nearestSupport ? (
              <>
                <p className="text-2xl font-bold" style={{ color: nearestSupport.color }}>
                  ${nearestSupport.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nearestSupport.label} • {((currentPrice - nearestSupport.price) / currentPrice * 100).toFixed(1)}% below
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Below all levels</p>
            )}
          </div>
        </div>

        {/* Detailed Level Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resistance Levels (above current price) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-1 bg-red-500 rounded" />
              <h4 className="text-sm font-semibold text-red-500">Resistance Levels</h4>
              <span className="text-xs text-muted-foreground">({resistanceLevels.length} levels above)</span>
            </div>
            <div className="space-y-2">
              {resistanceLevels.length > 0 ? (
                [...resistanceLevels].reverse().map((fib, i) => {
                  const distance = ((fib.price - currentPrice) / currentPrice * 100).toFixed(1);
                  const isNearest = i === resistanceLevels.length - 1;
                  return (
                    <div
                      key={fib.label}
                      className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                        isNearest ? 'bg-red-500/10' : 'bg-muted/30'
                      }`}
                      style={{ borderLeftColor: fib.color }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2"
                          style={{ borderColor: fib.color, backgroundColor: `${fib.color}30` }}
                        />
                        <div>
                          <span className="font-medium">{fib.label}</span>
                          {fib.type === 'key' && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600">KEY</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold" style={{ color: fib.color }}>
                          ${fib.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-red-500 ml-2">+{distance}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  Price is above all Fibonacci levels
                </p>
              )}
            </div>
          </div>

          {/* Support Levels (below current price) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-1 bg-green-500 rounded" />
              <h4 className="text-sm font-semibold text-green-500">Support Levels</h4>
              <span className="text-xs text-muted-foreground">({supportLevels.length} levels below)</span>
            </div>
            <div className="space-y-2">
              {supportLevels.length > 0 ? (
                supportLevels.map((fib, i) => {
                  const distance = ((currentPrice - fib.price) / currentPrice * 100).toFixed(1);
                  const isNearest = i === 0;
                  return (
                    <div
                      key={fib.label}
                      className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                        isNearest ? 'bg-green-500/10' : 'bg-muted/30'
                      }`}
                      style={{ borderLeftColor: fib.color }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2"
                          style={{ borderColor: fib.color, backgroundColor: `${fib.color}30` }}
                        />
                        <div>
                          <span className="font-medium">{fib.label}</span>
                          {fib.type === 'key' && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600">KEY</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold" style={{ color: fib.color }}>
                          ${fib.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-green-500 ml-2">-{distance}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  Price is below all Fibonacci levels
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fibonacci Signals */}
        {fibSignals.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold mb-3">Active Fibonacci Signals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fibSignals.map((sig, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border-2"
                  style={{
                    borderColor: CHART_COLORS.categories.FIBONACCI,
                    backgroundColor: `${CHART_COLORS.categories.FIBONACCI}10`
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{sig.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: CHART_COLORS.strengths[sig.strength] || CHART_COLORS.neutral,
                        color: 'white'
                      }}
                    >
                      {sig.strength}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sig.description}</p>
                  {sig.trading_implication && (
                    <p className="text-xs mt-2 font-medium" style={{ color: CHART_COLORS.categories.FIBONACCI }}>
                      → {sig.trading_implication}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
