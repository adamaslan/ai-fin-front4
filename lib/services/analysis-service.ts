import {
  AnalysisRepository,
  SignalRepository,
  AIOutputRepository,
} from '@/lib/repositories/analysis-repository';
import type { Analysis, Signal, FullAnalysis } from '@/lib/types/analysis';

export const AnalysisService = {
  async getFullAnalysis(symbol: string): Promise<FullAnalysis | null> {
    const analysis = await AnalysisRepository.getBySymbol(symbol);

    if (!analysis) {
      return null;
    }

    const [signals, aiOutput] = await Promise.all([
      SignalRepository.getByAnalysisId(analysis.id),
      AIOutputRepository.getByAnalysisId(analysis.id),
    ]);

    return { analysis, signals, aiOutput };
  },

  async getDashboardData(): Promise<{
    analyses: Analysis[];
    bullishSignals: Signal[];
  }> {
    const [analyses, bullishSignals] = await Promise.all([
      AnalysisRepository.getAll(),
      SignalRepository.getBullish(10),
    ]);

    return { analyses, bullishSignals };
  },

  async getAllSymbols(): Promise<string[]> {
    const analyses = await AnalysisRepository.getAll();
    return [...new Set(analyses.map((a) => a.symbol))];
  },
};
