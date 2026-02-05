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
  action: string[];
  factors: {
    creditStress: boolean;
    volatilitySpike: boolean;
    liquidityShock: boolean;
    externalShock: boolean;
  };
}

export type UserMode = 'Investor' | 'Trader';