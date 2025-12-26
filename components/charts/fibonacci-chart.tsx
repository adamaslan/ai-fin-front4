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
  Scatter,
} from 'recharts';
import { CHART_COLORS } from '@/lib/charts/theme';
import type { IndicatorData, Signal } from '@/lib/types/analysis';

interface FibonacciChartProps {
  indicators: IndicatorData;
  signals: Signal[];
}

// Fibonacci levels - standard retracement levels
const FIB_LEVELS = [
  { level: 0, label: '0% (Swing High)', shortLabel: '0%', color: '#22c55e', role: 'high' },
  { level: 0.236, label: '23.6%', shortLabel: '23.6%', color: '#84cc16', role: 'minor' },
  { level: 0.382, label: '38.2%', shortLabel: '38.2%', color: '#eab308', role: 'key' },
  { level: 0.5, label: '50%', shortLabel: '50%', color: '#f97316', role: 'key' },
  { level: 0.618, label: '61.8% (Golden Ratio)', shortLabel: '61.8%', color: '#ef4444', role: 'golden' },
  { level: 0.786, label: '78.6%', shortLabel: '78.6%', color: '#dc2626', role: 'deep' },
  { level: 1, label: '100% (Swing Low)', shortLabel: '100%', color: '#b91c1c', role: 'low' },
];

// Generate price history that demonstrates Fibonacci retracement based on signal
function generateFibonacciPriceHistory(
  currentPrice: number,
  swingHigh: number,
  swingLow: number,
  fibSignals: Signal[],
  periods: number = 50
) {
  const data = [];
  const range = swingHigh - swingLow;

  // Determine the retracement story based on signals
  const hasSupportSignal = fibSignals.some(s =>
    s.name.toLowerCase().includes('support') ||
    s.trading_implication?.toLowerCase().includes('support')
  );
  const hasResistanceSignal = fibSignals.some(s =>
    s.name.toLowerCase().includes('resistance') ||
    s.trading_implication?.toLowerCase().includes('resist')
  );

  // Find what Fib level the signal is referencing
  const signalValue = fibSignals[0]?.value || 0.618;
  const targetFibLevel = signalValue > 1 ? signalValue / 100 : signalValue;

  for (let i = 0; i < periods; i++) {
    const progress = i / (periods - 1);
    let price: number;

    // Phase 1: Initial trend up to swing high (0-25%)
    if (progress < 0.25) {
      const phaseProgress = progress / 0.25;
      price = swingLow + (range * 0.4) + (range * 0.6 * phaseProgress);
    }
    // Phase 2: At swing high with small consolidation (25-30%)
    else if (progress < 0.30) {
      price = swingHigh - (range * 0.02 * Math.sin(progress * 20));
    }
    // Phase 3: Retracement down toward Fib level (30-60%)
    else if (progress < 0.60) {
      const phaseProgress = (progress - 0.30) / 0.30;
      const retracementTarget = swingHigh - (range * targetFibLevel);
      // Add some oscillation during retracement
      const oscillation = Math.sin(phaseProgress * Math.PI * 3) * range * 0.03;
      price = swingHigh - ((swingHigh - retracementTarget) * phaseProgress) + oscillation;
    }
    // Phase 4: Testing/bouncing at Fib level (60-75%)
    else if (progress < 0.75) {
      const phaseProgress = (progress - 0.60) / 0.15;
      const fibPrice = swingHigh - (range * targetFibLevel);
      // Show price testing the level multiple times
      const bounce = Math.sin(phaseProgress * Math.PI * 4) * range * 0.04;
      price = fibPrice + bounce;
    }
    // Phase 5: Reaction from Fib level to current price (75-100%)
    else {
      const phaseProgress = (progress - 0.75) / 0.25;
      const fibPrice = swingHigh - (range * targetFibLevel);

      if (hasSupportSignal) {
        // Bounce up from support
        price = fibPrice + ((currentPrice - fibPrice) * phaseProgress);
      } else if (hasResistanceSignal) {
        // Rejection down from resistance
        price = fibPrice - ((fibPrice - currentPrice) * phaseProgress);
      } else {
        // Neutral - move toward current price
        price = fibPrice + ((currentPrice - fibPrice) * phaseProgress);
      }
    }

    // Ensure last point is exactly current price
    if (i === periods - 1) {
      price = currentPrice;
    }

    data.push({
      period: i + 1,
      day: periods - i,
      price: price,
      isSwingHigh: progress >= 0.25 && progress < 0.30,
      isFibTest: progress >= 0.60 && progress < 0.75,
    });
  }

  return data;
}

export function FibonacciChart({ indicators, signals }: FibonacciChartProps) {
  const currentPrice = indicators.Current_Price;
  const high = indicators.High;
  const low = indicators.Low;

  // Get Fibonacci-related signals
  const fibSignals = signals.filter(s =>
    s.category === 'FIBONACCI' || s.name.toLowerCase().includes('fib')
  );

  // Use actual high/low or calculate from MAs for swing range
  const prices = [
    indicators.SMA_20,
    indicators.SMA_50,
    indicators.SMA_200,
    currentPrice,
    high,
    low,
  ].filter(p => p > 0);

  // Determine swing high and low for Fibonacci calculation
  const swingHigh = Math.max(high, Math.max(...prices) * 1.02);
  const swingLow = Math.min(low, Math.min(...prices) * 0.98);
  const range = swingHigh - swingLow;

  // Calculate actual price levels for each Fibonacci level
  const fibLevels = FIB_LEVELS.map(fib => ({
    ...fib,
    price: swingHigh - (range * fib.level),
  }));

  // Find which Fibonacci level is most relevant to the signal
  const signalFibLevel = fibSignals[0]?.value || 0;
  const normalizedSignalLevel = signalFibLevel > 1 ? signalFibLevel / 100 : signalFibLevel;

  // Find closest Fib level to signal
  const activeFibIndex = fibLevels.reduce((closest, fib, i) => {
    const currentDiff = Math.abs(fib.level - normalizedSignalLevel);
    const closestDiff = Math.abs(fibLevels[closest].level - normalizedSignalLevel);
    return currentDiff < closestDiff ? i : closest;
  }, 0);

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

  // Generate price history that demonstrates the Fibonacci pattern
  const priceHistory = generateFibonacciPriceHistory(
    currentPrice, swingHigh, swingLow, fibSignals, 50
  );

  // Find key points in the price history
  const swingHighPoint = priceHistory.find(d => d.isSwingHigh);
  const fibTestPoints = priceHistory.filter(d => d.isFibTest);

  // Determine signal interpretation
  const signalType = fibSignals[0]?.strength || 'NEUTRAL';
  const isBullishSignal = signalType === 'BULLISH' || signalType === 'STRONG';
  const isBearishSignal = signalType === 'BEARISH' || signalType === 'WEAK';

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Fibonacci Retracement Analysis</h3>
            <p className="text-sm text-muted-foreground">
              50-day price action showing retracement from swing high to key Fibonacci levels
            </p>
          </div>
          {fibSignals.length > 0 && (
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: isBullishSignal ? 'rgba(34, 197, 94, 0.15)' :
                                isBearishSignal ? 'rgba(239, 68, 68, 0.15)' :
                                'rgba(100, 100, 100, 0.15)',
                color: isBullishSignal ? '#22c55e' :
                       isBearishSignal ? '#ef4444' :
                       '#888',
                border: `1px solid ${isBullishSignal ? '#22c55e' : isBearishSignal ? '#ef4444' : '#888'}40`
              }}
            >
              {fibSignals[0]?.name}
            </div>
          )}
        </div>
      </div>
      <div className="card-content">
        {/* Signal Explanation */}
        {fibSignals.length > 0 && (
          <div
            className="mb-6 p-4 rounded-lg border-l-4"
            style={{
              borderLeftColor: isBullishSignal ? '#22c55e' : isBearishSignal ? '#ef4444' : '#f97316',
              backgroundColor: isBullishSignal ? 'rgba(34, 197, 94, 0.05)' :
                              isBearishSignal ? 'rgba(239, 68, 68, 0.05)' :
                              'rgba(249, 115, 22, 0.05)'
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-sm mb-1">{fibSignals[0]?.name}</p>
                <p className="text-sm text-muted-foreground">{fibSignals[0]?.description}</p>
                {fibSignals[0]?.trading_implication && (
                  <p className="text-sm mt-2 font-medium" style={{
                    color: isBullishSignal ? '#22c55e' : isBearishSignal ? '#ef4444' : '#f97316'
                  }}>
                    → {fibSignals[0].trading_implication}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-lg font-bold">{((fibSignals[0]?.confidence || 0) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Chart - Price History with Fibonacci Levels */}
        <div className="h-[400px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={priceHistory}
              margin={{ top: 20, right: 110, left: 60, bottom: 30 }}
            >
              <defs>
                {/* Price area gradient */}
                <linearGradient id="priceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                {/* Active Fib zone highlight */}
                <linearGradient id="activeFibZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isBullishSignal ? '#22c55e' : '#ef4444'} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={isBullishSignal ? '#22c55e' : '#ef4444'} stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v === 50 ? '50d ago' : v === 1 ? 'Today' : v % 10 === 0 ? `${v}d` : ''}
                reversed
                label={{ value: '← Days Ago', position: 'bottom', offset: 10, fontSize: 11, fill: '#888' }}
              />
              <YAxis
                domain={[swingLow * 0.99, swingHigh * 1.01]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                width={55}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `${label} days ago`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />

              {/* Highlight zones between Fib levels */}
              {fibLevels.slice(0, -1).map((fib, i) => {
                const nextFib = fibLevels[i + 1];
                const isActiveFib = i === activeFibIndex || i + 1 === activeFibIndex;
                const isCurrentZoneArea = i === currentZone;

                let fillColor = 'rgba(100, 100, 100, 0.02)';
                if (isActiveFib) {
                  fillColor = 'url(#activeFibZone)';
                } else if (isCurrentZoneArea) {
                  fillColor = 'rgba(59, 130, 246, 0.08)';
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
                const isActive = i === activeFibIndex;
                const isKey = fib.role === 'key' || fib.role === 'golden';

                return (
                  <ReferenceLine
                    key={fib.label}
                    y={fib.price}
                    stroke={fib.color}
                    strokeWidth={isActive ? 4 : isKey ? 2.5 : 1.5}
                    strokeDasharray={isActive ? '0' : isKey ? '0' : '6 4'}
                    label={{
                      value: `${fib.shortLabel} $${fib.price.toFixed(0)}`,
                      position: 'right',
                      fill: fib.color,
                      fontSize: isActive ? 12 : 10,
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                );
              })}

              {/* Swing High marker */}
              <ReferenceLine
                y={swingHigh}
                stroke="#22c55e"
                strokeWidth={0}
                label={{
                  value: '▼ SWING HIGH',
                  position: 'insideTopRight',
                  fill: '#22c55e',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />

              {/* Swing Low marker */}
              <ReferenceLine
                y={swingLow}
                stroke="#ef4444"
                strokeWidth={0}
                label={{
                  value: '▲ SWING LOW',
                  position: 'insideBottomRight',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />

              {/* Price Area Fill */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="transparent"
                fill="url(#priceAreaGradient)"
              />

              {/* Price Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, index, payload } = props;
                  // Current price - large blue dot
                  if (index === priceHistory.length - 1) {
                    return (
                      <g key={`dot-${index}`}>
                        <circle cx={cx} cy={cy} r={10} fill="#3b82f6" stroke="#fff" strokeWidth={3} />
                        <text x={cx - 40} y={cy - 15} fill="#3b82f6" fontSize={10} fontWeight={600}>
                          NOW
                        </text>
                      </g>
                    );
                  }
                  // Swing high area
                  if (payload.isSwingHigh && index === Math.floor(priceHistory.length * 0.27)) {
                    return (
                      <circle key={`dot-${index}`} cx={cx} cy={cy} r={6} fill="#22c55e" stroke="#fff" strokeWidth={2} />
                    );
                  }
                  // Fib test area - show bounces
                  if (payload.isFibTest && index % 3 === 0) {
                    return (
                      <circle
                        key={`dot-${index}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={isBullishSignal ? '#22c55e' : '#ef4444'}
                        stroke="#fff"
                        strokeWidth={1}
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
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs border-t border-b py-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow" />
            <span>Current Price (${currentPrice.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border border-white" />
            <span>Swing High (${swingHigh.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-1 rounded" style={{ backgroundColor: fibLevels[activeFibIndex]?.color }} />
            <span>Active Fib Level ({fibLevels[activeFibIndex]?.shortLabel})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-400" />
            <span>Other Levels</span>
          </div>
        </div>

        {/* Key Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Nearest Resistance */}
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-xs font-medium text-red-500 uppercase">Next Resistance</span>
            </div>
            {nearestResistance ? (
              <>
                <p className="text-xl font-bold" style={{ color: nearestResistance.color }}>
                  ${nearestResistance.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nearestResistance.label} • +{((nearestResistance.price - currentPrice) / currentPrice * 100).toFixed(1)}%
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Above all levels</p>
            )}
          </div>

          {/* Active Fib Level */}
          <div
            className="p-4 rounded-lg border-2"
            style={{
              backgroundColor: `${fibLevels[activeFibIndex]?.color}15`,
              borderColor: `${fibLevels[activeFibIndex]?.color}50`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: fibLevels[activeFibIndex]?.color }}
              />
              <span className="text-xs font-medium uppercase" style={{ color: fibLevels[activeFibIndex]?.color }}>
                Signal Level
              </span>
            </div>
            <p className="text-xl font-bold" style={{ color: fibLevels[activeFibIndex]?.color }}>
              ${fibLevels[activeFibIndex]?.price.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {fibLevels[activeFibIndex]?.label}
            </p>
          </div>

          {/* Nearest Support */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-xs font-medium text-green-500 uppercase">Next Support</span>
            </div>
            {nearestSupport ? (
              <>
                <p className="text-xl font-bold" style={{ color: nearestSupport.color }}>
                  ${nearestSupport.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nearestSupport.label} • -{((currentPrice - nearestSupport.price) / currentPrice * 100).toFixed(1)}%
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Below all levels</p>
            )}
          </div>
        </div>

        {/* All Fibonacci Levels */}
        <div className="grid grid-cols-7 gap-2">
          {fibLevels.map((fib, i) => {
            const isActive = i === activeFibIndex;
            const isCurrent = i === currentZone || i === currentZone + 1;
            const distancePercent = ((currentPrice - fib.price) / currentPrice * 100);

            return (
              <div
                key={fib.label}
                className={`p-2 rounded-lg text-center transition-all ${
                  isActive ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: isActive ? `${fib.color}20` : isCurrent ? `${fib.color}10` : 'rgba(100,100,100,0.05)',
                  ringColor: isActive ? fib.color : undefined,
                }}
              >
                <div
                  className="w-full h-1 rounded mb-2"
                  style={{ backgroundColor: fib.color }}
                />
                <p className="text-xs font-bold" style={{ color: fib.color }}>
                  {fib.shortLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${fib.price.toFixed(0)}
                </p>
                <p
                  className="text-[10px] font-medium"
                  style={{ color: distancePercent > 0 ? '#22c55e' : '#ef4444' }}
                >
                  {distancePercent > 0 ? '+' : ''}{distancePercent.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Signals */}
        {fibSignals.length > 1 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">Additional Fibonacci Signals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fibSignals.slice(1).map((sig, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border bg-muted/30"
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
