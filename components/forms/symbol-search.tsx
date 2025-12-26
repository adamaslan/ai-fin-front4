'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function SymbolSearch() {
  const [symbol, setSymbol] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    startTransition(() => {
      router.push(`/analysis/${symbol.toUpperCase()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter symbol..."
        className="px-3 py-2 border rounded flex-1"
        maxLength={5}
      />
      <button
        type="submit"
        disabled={isPending || !symbol.trim()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
      >
        {isPending ? 'Loading...' : 'Search'}
      </button>
    </form>
  );
}
