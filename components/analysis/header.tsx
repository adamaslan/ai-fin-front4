import Link from 'next/link';
import type { Analysis } from '@/lib/types/analysis';
import { formatDate } from '@/lib/utils/format';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export function AnalysisHeader({ analysis }: AnalysisHeaderProps) {
  const { signal_summary } = analysis;

  return (
    <header className="border-b pb-6">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Dashboard
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{analysis.symbol}</h1>
          <p className="text-muted-foreground">
            {formatDate(analysis.timestamp)} | {analysis.interval} |{' '}
            {analysis.bars_analyzed} bars
          </p>
        </div>

        <div className="flex gap-4 text-sm">
          <SignalBadge
            label="Bullish"
            count={signal_summary.bullish}
            variant="success"
          />
          <SignalBadge
            label="Bearish"
            count={signal_summary.bearish}
            variant="danger"
          />
          <SignalBadge
            label="Neutral"
            count={signal_summary.neutral}
            variant="muted"
          />
        </div>
      </div>
    </header>
  );
}

interface SignalBadgeProps {
  label: string;
  count: number;
  variant: 'success' | 'danger' | 'muted';
}

function SignalBadge({ label, count, variant }: SignalBadgeProps) {
  const colors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
    muted: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full ${colors[variant]}`}>
      {label}: {count}
    </span>
  );
}
