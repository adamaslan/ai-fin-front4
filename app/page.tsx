import { Suspense } from 'react';
import Link from 'next/link';
import { AnalysisService } from '@/lib/services/analysis-service';
import { SymbolSearch } from '@/components/forms/symbol-search';
import { TableSkeleton, SignalsSkeleton } from '@/components/skeletons';
import { formatDate } from '@/lib/utils/format';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const revalidate = 300;

export default async function HomePage() {
  return (
    <main className="container mx-auto py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Financial Analysis</h1>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground">
          Technical analysis and AI insights for stocks
        </p>
        <div className="max-w-md">
          <SymbolSearch />
        </div>
      </header>

      <Suspense fallback={<TableSkeleton />}>
        <AnalysisList />
      </Suspense>

      <Suspense fallback={<SignalsSkeleton />}>
        <TopSignals />
      </Suspense>
    </main>
  );
}

async function AnalysisList() {
  const { analyses } = await AnalysisService.getDashboardData();

  if (analyses.length === 0) {
    return (
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
        <p className="text-muted-foreground">
          No analyses found. Run the Python pipeline to generate data.
        </p>
      </section>
    );
  }

  return (
    <section className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Symbol</th>
              <th className="text-left p-2">Interval</th>
              <th className="text-left p-2">Last Updated</th>
              <th className="text-center p-2">Bullish</th>
              <th className="text-center p-2">Bearish</th>
              <th className="text-center p-2">Neutral</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr key={analysis.id} className="border-b hover:bg-muted/50">
                <td className="p-2 font-medium">{analysis.symbol}</td>
                <td className="p-2">{analysis.interval}</td>
                <td className="p-2 text-muted-foreground">
                  {formatDate(analysis.timestamp)}
                </td>
                <td className="p-2 text-center text-green-600 dark:text-green-400">
                  {analysis.signal_summary.bullish}
                </td>
                <td className="p-2 text-center text-red-600 dark:text-red-400">
                  {analysis.signal_summary.bearish}
                </td>
                <td className="p-2 text-center text-gray-600 dark:text-gray-400">
                  {analysis.signal_summary.neutral}
                </td>
                <td className="p-2 text-right">
                  <Link
                    href={`/analysis/${analysis.symbol}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

async function TopSignals() {
  const { bullishSignals } = await AnalysisService.getDashboardData();

  if (bullishSignals.length === 0) {
    return null;
  }

  return (
    <section className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Top Bullish Signals</h2>
      <div className="space-y-2">
        {bullishSignals.slice(0, 5).map((signal) => (
          <div
            key={signal.id}
            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded"
          >
            <div>
              <Link
                href={`/analysis/${signal.symbol}`}
                className="font-medium text-green-800 dark:text-green-400 hover:underline"
              >
                {signal.symbol}
              </Link>
              <span className="text-green-600 dark:text-green-500 mx-2">-</span>
              <span className="text-green-700 dark:text-green-400">{signal.name}</span>
            </div>
            <span className="text-green-800 dark:text-green-400 font-medium">
              {(signal.confidence * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
