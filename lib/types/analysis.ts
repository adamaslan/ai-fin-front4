export interface Analysis {
  id: string;
  symbol: string;
  interval: string;
  timestamp: Date;
  bars_analyzed: number;
  indicators: IndicatorData;
  signal_summary: SignalSummary;
  ai_enabled: boolean;
}

export interface Signal {
  id: string;
  analysis_id: string;
  symbol: string;
  name: string;
  category: SignalCategory;
  strength: SignalStrength;
  confidence: number;
  description: string;
  trading_implication: string | null;
  value: number;
  indicator_name: string;
}

export interface AIOutput {
  id: string;
  signal_summary: string;
  trading_recommendation: TradingRecommendation;
  risk_assessment: RiskAssessment;
  volatility_regime: VolatilityRegime;
  opportunities: Opportunity[];
  alerts: Alert[];
}

export type SignalStrength = 'WEAK' | 'MODERATE' | 'STRONG' | 'NEUTRAL' | 'BULLISH' | 'BEARISH';

export type SignalCategory =
  | 'FIBONACCI'
  | 'MA_RIBBON'
  | 'MA_POSITION'
  | 'RSI'
  | 'STOCHASTIC'
  | 'MACD';

export interface IndicatorData {
  Current_Price: number;
  Open: number;
  High: number;
  Low: number;
  Volume: number;
  MACD: number;
  MACD_Signal: number;
  OBV: number;
  SMA_10: number;
  SMA_20: number;
  SMA_50: number;
  SMA_100: number;
  SMA_200: number;
  [key: string]: number;
}

export interface SignalSummary {
  total: number;
  bullish: number;
  bearish: number;
  neutral: number;
}

export interface TradingRecommendation {
  recommendation: 'BUY' | 'SELL' | 'NEUTRAL';
  entry: number;
  stop_loss: number;
  target: number;
  risk_reward_ratio: number;
  confidence: number;
  reasoning: string;
  position_size_adjustment: string;
}

export interface RiskAssessment {
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  identified_risks: string[];
  recommended_stop_loss_pct: number;
  position_size_adjustment: string;
}

export interface VolatilityRegime {
  regime: 'LOW_VOLATILITY' | 'NORMAL' | 'HIGH_VOLATILITY';
  hv_30d: string;
  atr_pct: string;
  recommended_action: string;
}

export interface Opportunity {
  type: string;
  description: string;
  entry_trigger: string;
  confidence: number;
  action: string;
}

export interface Alert {
  type: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface FullAnalysis {
  analysis: Analysis;
  signals: Signal[];
  aiOutput: AIOutput | null;
}
