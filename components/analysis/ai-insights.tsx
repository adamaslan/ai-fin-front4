import type { AIOutput } from '@/lib/types/analysis';

interface AIInsightsProps {
  output: AIOutput | null;
}

export function AIInsights({ output }: AIInsightsProps) {
  if (!output) {
    return (
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
        <p className="text-muted-foreground">AI analysis not available</p>
      </section>
    );
  }

  const { trading_recommendation, risk_assessment, volatility_regime } = output;

  return (
    <section className="border rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold">AI Insights</h2>

      <RecommendationCard recommendation={trading_recommendation} />

      <div>
        <h3 className="font-medium mb-2">Risk Assessment</h3>
        <div className="flex items-center gap-2">
          <RiskBadge level={risk_assessment.overall_risk_level} />
          <span className="text-sm text-muted-foreground">
            {risk_assessment.position_size_adjustment}
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Volatility Regime</h3>
        <p className="text-sm">{volatility_regime.regime.replace(/_/g, ' ')}</p>
        <p className="text-sm text-muted-foreground">
          {volatility_regime.recommended_action}
        </p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Analysis Summary</h3>
        <div className="text-sm space-y-2 whitespace-pre-line">
          {output.signal_summary}
        </div>
      </div>
    </section>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: AIOutput['trading_recommendation'];
}) {
  const colors = {
    BUY: 'border-green-500 bg-green-50',
    SELL: 'border-red-500 bg-red-50',
    NEUTRAL: 'border-gray-300 bg-gray-50',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${colors[recommendation.recommendation]}`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold">{recommendation.recommendation}</span>
        <span className="text-sm">
          {(recommendation.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>
      <p className="text-sm">{recommendation.reasoning}</p>
      <p className="text-xs text-muted-foreground mt-2">
        {recommendation.position_size_adjustment}
      </p>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[level] ?? colors.MEDIUM
      }`}
    >
      {level}
    </span>
  );
}
