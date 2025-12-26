import { getDb } from '@/lib/firebase-admin';
import type { Analysis, Signal, AIOutput } from '@/lib/types/analysis';

function toAnalysis(doc: FirebaseFirestore.DocumentSnapshot): Analysis {
  const data = doc.data();
  if (!data) {
    throw new Error(`Analysis not found: ${doc.id}`);
  }

  return {
    id: doc.id,
    symbol: data.symbol,
    interval: data.interval,
    timestamp: data.timestamp?.toDate() ?? new Date(),
    bars_analyzed: data.bars_analyzed,
    indicators: data.indicators,
    signal_summary: data.signal_summary,
    ai_enabled: data.ai_enabled,
  };
}

function toSignal(doc: FirebaseFirestore.DocumentSnapshot): Signal {
  const data = doc.data();
  if (!data) {
    throw new Error(`Signal not found: ${doc.id}`);
  }

  return {
    id: doc.id,
    analysis_id: data.analysis_id,
    symbol: data.symbol,
    name: data.name,
    category: data.category,
    strength: data.strength,
    confidence: data.confidence,
    description: data.description,
    trading_implication: data.trading_implication,
    value: data.value,
    indicator_name: data.indicator_name,
  };
}

function toAIOutput(doc: FirebaseFirestore.DocumentSnapshot): AIOutput {
  const data = doc.data();
  if (!data) {
    throw new Error(`AI Output not found: ${doc.id}`);
  }

  return {
    id: doc.id,
    signal_summary: data.signal_summary,
    trading_recommendation: data.trading_recommendation,
    risk_assessment: data.risk_assessment,
    volatility_regime: data.volatility_regime,
    opportunities: data.opportunities ?? [],
    alerts: data.alerts ?? [],
  };
}

export const AnalysisRepository = {
  async getAll(): Promise<Analysis[]> {
    const db = getDb();
    const snapshot = await db
      .collection('analyses')
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(toAnalysis);
  },

  async getBySymbol(symbol: string): Promise<Analysis | null> {
    const db = getDb();
    // Fetch without orderBy to avoid composite index requirement
    const snapshot = await db
      .collection('analyses')
      .where('symbol', '==', symbol.toUpperCase())
      .get();

    if (snapshot.empty) {
      return null;
    }

    // Sort by timestamp descending in-memory and return the most recent
    const analyses = snapshot.docs.map(toAnalysis);
    analyses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return analyses[0];
  },

  async getById(id: string): Promise<Analysis | null> {
    const db = getDb();
    const doc = await db.collection('analyses').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return toAnalysis(doc);
  },
};

export const SignalRepository = {
  async getByAnalysisId(analysisId: string): Promise<Signal[]> {
    const db = getDb();
    const snapshot = await db
      .collection('signals')
      .where('analysis_id', '==', analysisId)
      .get();

    return snapshot.docs.map(toSignal);
  },

  async getBySymbol(symbol: string): Promise<Signal[]> {
    const db = getDb();
    const snapshot = await db
      .collection('signals')
      .where('symbol', '==', symbol.toUpperCase())
      .get();

    return snapshot.docs.map(toSignal);
  },

  async getByCategory(category: string): Promise<Signal[]> {
    const db = getDb();
    const snapshot = await db
      .collection('signals')
      .where('category', '==', category)
      .get();

    return snapshot.docs.map(toSignal);
  },

  async getBullish(limit = 20): Promise<Signal[]> {
    const db = getDb();
    // Fetch without orderBy to avoid composite index requirement
    // Sort in-memory instead
    const snapshot = await db
      .collection('signals')
      .where('strength', '==', 'BULLISH')
      .get();

    const signals = snapshot.docs.map(toSignal);

    // Sort by confidence descending in-memory
    signals.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

    return signals.slice(0, limit);
  },
};

export const AIOutputRepository = {
  async getByAnalysisId(analysisId: string): Promise<AIOutput | null> {
    const db = getDb();
    const doc = await db.collection('ai_outputs').doc(analysisId).get();

    if (!doc.exists) {
      return null;
    }

    return toAIOutput(doc);
  },
};
