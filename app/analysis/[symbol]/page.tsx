import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AnalysisService } from '@/lib/services/analysis-service';
import { AnalysisHeader } from '@/components/analysis/header';
import { SignalChartsSection } from '@/components/analysis/signal-charts-section';
import { SignalList } from '@/components/analysis/signal-list';
import { IndicatorGrid } from '@/components/analysis/indicator-grid';
import { AIInsights } from '@/components/analysis/ai-insights';
import { IndicatorChart } from '@/components/charts/indicator-chart';
import { MACDChart } from '@/components/charts/macd-chart';
import { FibonacciChart } from '@/components/charts/fibonacci-chart';
import { CrossoverChart } from '@/components/charts/crossover-chart';
import {
  ChartSkeleton,
  SignalsSkeleton,
  AIInsightsSkeleton,
} from '@/components/skeletons';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export const revalidate = 300;

export default async function AnalysisPage({ params }: PageProps) {
  const { symbol } = await params;
  const data = await AnalysisService.getFullAnalysis(symbol);

  if (!data) {
    notFound();
  }

  const { analysis, signals, aiOutput } = data;

  return (
    <main className="container mx-auto py-8 space-y-8">
      <AnalysisHeader analysis={analysis} />

      <IndicatorGrid indicators={analysis.indicators} />

      {/* Signal Overview Charts */}
      <Suspense fallback={<ChartSkeleton />}>
        <SignalChartsSection signals={signals} />
      </Suspense>

      {/* Crossover & Momentum Analysis */}
      <Suspense fallback={<ChartSkeleton />}>
        <CrossoverChart indicators={analysis.indicators} signals={signals} />
      </Suspense>

      {/* MACD Analysis with 50% Graph */}
      {hasMACD(analysis.indicators) && (
        <Suspense fallback={<ChartSkeleton />}>
          <MACDChart indicators={analysis.indicators} signals={signals} />
        </Suspense>
      )}

      {/* Fibonacci Retracement Analysis */}
      {hasFibonacciSignals(signals) && (
        <Suspense fallback={<ChartSkeleton />}>
          <FibonacciChart indicators={analysis.indicators} signals={signals} />
        </Suspense>
      )}

      {/* Signals & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<SignalsSkeleton />}>
          <SignalList signals={signals} />
        </Suspense>

        <Suspense fallback={<AIInsightsSkeleton />}>
          <AIInsights output={aiOutput} />
        </Suspense>
      </div>

      {/* Price vs Moving Averages */}
      {hasMovingAverages(analysis.indicators) && (
        <Suspense fallback={<ChartSkeleton />}>
          <IndicatorChart
            indicators={analysis.indicators}
            showMAs={true}
            showMACD={false}
          />
        </Suspense>
      )}
    </main>
  );
}

function hasMovingAverages(indicators: Record<string, unknown>): boolean {
  return Object.keys(indicators).some((k) => k.startsWith('SMA_'));
}

function hasMACD(indicators: Record<string, unknown>): boolean {
  return 'MACD' in indicators && 'MACD_Signal' in indicators;
}

function hasFibonacciSignals(signals: { category?: string }[]): boolean {
  return signals.some((s) => s.category === 'FIBONACCI');
}

export async function generateMetadata({ params }: PageProps) {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} Analysis | AI Financial Analysis`,
    description: `Technical analysis and AI insights for ${symbol.toUpperCase()}`,
  };
}
