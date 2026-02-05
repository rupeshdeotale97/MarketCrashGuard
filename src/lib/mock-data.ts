import { MarketRiskData } from './types';

export const getDailyRiskData = (): MarketRiskData => {
  // In a real app, this would be a cached fetch from an API
  return {
    date: new Date().toISOString().split('T')[0],
    usRisk: 'ELEVATED',
    indiaRisk: 'LOW',
    cryptoRisk: 'HIGH',
    globalRisk: 'FRAGILE',
    riskJumpDay: true,
    crashConfirmed: false,
    action: [
      "Stay calm",
      "Avoid leverage",
      "Keep dry cash"
    ],
    factors: {
      creditStress: false,
      volatilitySpike: true,
      liquidityShock: true,
      externalShock: false,
    }
  };
};