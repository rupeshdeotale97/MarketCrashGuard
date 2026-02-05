import { MarketRiskData } from './types';

export const getDailyRiskData = (): MarketRiskData => {
  return {
    date: new Date().toISOString().split('T')[0],
    usRisk: 'ELEVATED',
    indiaRisk: 'LOW',
    cryptoRisk: 'HIGH',
    globalRisk: 'FRAGILE',
    riskJumpDay: true,
    crashConfirmed: false,
    earlyWarning: true,
    protectionScore: 72,
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

export const getHistoricalData = (year: string): Partial<MarketRiskData> => {
  const data: Record<string, Partial<MarketRiskData>> = {
    '2008': {
      date: 'September 15, 2008',
      globalRisk: 'STRESSED',
      usRisk: 'CRASH',
      riskJumpDay: true,
      crashConfirmed: true,
      factors: { creditStress: true, volatilitySpike: true, liquidityShock: true, externalShock: true }
    },
    '2020': {
      date: 'March 12, 2020',
      globalRisk: 'STRESSED',
      usRisk: 'CRASH',
      riskJumpDay: true,
      crashConfirmed: true,
      factors: { creditStress: false, volatilitySpike: true, liquidityShock: true, externalShock: true }
    },
    '2022': {
      date: 'May 12, 2022',
      cryptoRisk: 'CRASH',
      globalRisk: 'FRAGILE',
      riskJumpDay: true,
      crashConfirmed: true,
      factors: { creditStress: false, volatilitySpike: true, liquidityShock: true, externalShock: false }
    }
  };
  return data[year] || data['2008'];
};
