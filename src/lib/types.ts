export type RiskLevel = 'LOW' | 'VERY_LOW' | 'ELEVATED' | 'HIGH' | 'CRASH';
export type SystemStatus = 'STABLE' | 'FRAGILE' | 'STRESSED';

export interface MarketRiskData {
  date: string;
  usRisk: RiskLevel;
  indiaRisk: RiskLevel;
  cryptoRisk: RiskLevel;
  globalRisk: SystemStatus;
  riskJumpDay: boolean;
  crashConfirmed: boolean;
  earlyWarning: boolean;
  protectionScore: number;
  action: string[];
  factors: {
    creditStress: boolean;
    volatilitySpike: boolean;
    liquidityShock: boolean;
    externalShock: boolean;
  };
}

export type UserMode = 'Investor' | 'Trader';
export type ExposureStatus = 'BALANCED' | 'OVEREXPOSED' | 'DEFENSIVE';

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'action_click' | 'support_intent' | 'support_complete';
  label: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
