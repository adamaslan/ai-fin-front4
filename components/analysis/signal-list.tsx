import type { Signal } from '@/lib/types/analysis';

interface SignalListProps {
  signals: Signal[];
}

export function SignalList({ signals }: SignalListProps) {
  if (signals.length === 0) {
    return (
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Signals</h2>
        <p className="text-muted-foreground">No signals detected</p>
      </section>
    );
  }

  const grouped = signals.reduce<Record<string, Signal[]>>((acc, signal) => {
    const category = signal.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(signal);
    return acc;
  }, {});

  return (
    <section className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Signals ({signals.length})</h2>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categorySignals]) => (
          <SignalCategory
            key={category}
            category={category}
            signals={categorySignals}
          />
        ))}
      </div>
    </section>
  );
}

interface SignalCategoryProps {
  category: string;
  signals: Signal[];
}

function SignalCategory({ category, signals }: SignalCategoryProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {category.replace(/_/g, ' ')}
      </h3>
      <ul className="space-y-2">
        {signals.map((signal) => (
          <SignalItem key={signal.id} signal={signal} />
        ))}
      </ul>
    </div>
  );
}

function SignalItem({ signal }: { signal: Signal }) {
  const strengthColors: Record<string, string> = {
    BULLISH: 'text-green-600',
    BEARISH: 'text-red-600',
    STRONG: 'text-green-600',
    MODERATE: 'text-yellow-600',
    WEAK: 'text-gray-500',
    NEUTRAL: 'text-gray-500',
  };

  return (
    <li className="flex items-start justify-between p-3 bg-muted/50 rounded">
      <div>
        <p className="font-medium">{signal.name}</p>
        <p className="text-sm text-muted-foreground">{signal.description}</p>
        {signal.trading_implication && (
          <p className="text-sm mt-1 italic">{signal.trading_implication}</p>
        )}
      </div>
      <div className="text-right">
        <span className={`font-medium ${strengthColors[signal.strength] ?? ''}`}>
          {signal.strength}
        </span>
        <p className="text-xs text-muted-foreground">
          {(signal.confidence * 100).toFixed(0)}% conf
        </p>
      </div>
    </li>
  );
}
