import type { IndicatorData } from '@/lib/types/analysis';
import { formatNumber, formatVolume } from '@/lib/utils/format';

interface IndicatorGridProps {
  indicators: IndicatorData;
}

export function IndicatorGrid({ indicators }: IndicatorGridProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <IndicatorCard
        label="Price"
        value={formatNumber(indicators.Current_Price)}
        highlight
      />
      <IndicatorCard label="Volume" value={formatVolume(indicators.Volume)} />
      <IndicatorCard
        label="MACD"
        value={formatNumber(indicators.MACD, 4)}
        trend={indicators.MACD > indicators.MACD_Signal ? 'up' : 'down'}
      />
      <IndicatorCard label="SMA 20" value={formatNumber(indicators.SMA_20)} />
      <IndicatorCard label="SMA 50" value={formatNumber(indicators.SMA_50)} />
      <IndicatorCard label="SMA 200" value={formatNumber(indicators.SMA_200)} />
    </section>
  );
}

interface IndicatorCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  trend?: 'up' | 'down';
}

function IndicatorCard({ label, value, highlight, trend }: IndicatorCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-lg font-semibold ${
          trend === 'up'
            ? 'text-green-600'
            : trend === 'down'
            ? 'text-red-600'
            : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
