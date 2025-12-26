import type { Signal } from '@/lib/types/analysis';
import { SignalChartFactory } from '@/components/charts/signal-chart-factory';

interface SignalChartsSectionProps {
  signals: Signal[];
}

export function SignalChartsSection({ signals }: SignalChartsSectionProps) {
  const categories = [...new Set(signals.map((s) => s.category))];
  const hasManyCategories = categories.length >= 3;
  const hasManySignals = signals.length >= 5;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Signal Analysis</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-medium">Signal Overview</h3>
          </div>
          <div className="card-content">
            <SignalChartFactory signals={signals} variant="auto" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-medium">Aggregate Confidence</h3>
          </div>
          <div className="card-content">
            <SignalChartFactory signals={signals} variant="gauge" />
          </div>
        </div>

        {hasManyCategories && (
          <div className="card">
            <div className="card-header">
              <h3 className="font-medium">By Category</h3>
            </div>
            <div className="card-content">
              <SignalChartFactory signals={signals} variant="pie" />
            </div>
          </div>
        )}

        {hasManySignals && (
          <div className="card lg:col-span-2">
            <div className="card-header">
              <h3 className="font-medium">Signal Confidence Ranking</h3>
            </div>
            <div className="card-content">
              <SignalChartFactory signals={signals} variant="bar" />
            </div>
          </div>
        )}

        {hasManyCategories && hasManySignals && (
          <div className="card lg:col-span-2">
            <div className="card-header">
              <h3 className="font-medium">Strength Distribution</h3>
            </div>
            <div className="card-content">
              <SignalChartFactory signals={signals} variant="heatmap" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
