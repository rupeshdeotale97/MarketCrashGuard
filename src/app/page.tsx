"use client";

import { useState, useEffect, useMemo } from "react";
import { RiskCard } from "@/components/risk-card";
import {
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Calendar,
  Info,
  Zap,
  Compass,
  ArrowRight,
  Bell,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { MarketRiskData, RiskLevel, SystemStatus } from "@/lib/types";

type MarketStat = {
  price: number;
  change1d: number;
  change5d: number;
  asOf: string;
};

type MarketPulse = {
  asOf: string;
  indices: {
    nifty: MarketStat;
    sensex: MarketStat;
    banknifty: MarketStat;
    spx: MarketStat;
    vix: MarketStat;
  };
  fx: {
    usdinr: MarketStat;
  };
  metals: {
    xauusd: MarketStat;
  };
  crypto: {
    btcusd: MarketStat;
    ethusd: MarketStat;
  };
  outlook: {
    mode: "GROWTH" | "BALANCED" | "DEFENSIVE";
    prediction: string;
    riskScore: number;
  };
  warnings?: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function deriveRiskLevel(change1d: number, stressedLevel: number, crashLevel: number): RiskLevel {
  if (change1d <= crashLevel) return "CRASH";
  if (change1d <= stressedLevel) return "HIGH";
  if (change1d <= -0.3) return "ELEVATED";
  return "LOW";
}

function deriveGlobalStatus(riskScore: number): SystemStatus {
  if (riskScore >= 66) return "STRESSED";
  if (riskScore >= 36) return "FRAGILE";
  return "STABLE";
}

function buildRealtimeRiskData(pulse: MarketPulse): MarketRiskData {
  const niftyMove = pulse.indices.nifty.change1d || 0;
  const sensexMove = pulse.indices.sensex.change1d || 0;
  const bankniftyMove = pulse.indices.banknifty.change1d || 0;
  const indiaAvgMove = (niftyMove + sensexMove + bankniftyMove) / 3;
  const spxMove = pulse.indices.spx.change1d || 0;
  const vixLevel = pulse.indices.vix.price || 0;
  const usdInrMove = pulse.fx.usdinr.change1d || 0;
  const goldMove = pulse.metals.xauusd.change1d || 0;
  const btcMove = pulse.crypto.btcusd.change1d || 0;
  const ethMove = pulse.crypto.ethusd.change1d || 0;

  const factors = {
    creditStress: vixLevel > 22 || usdInrMove > 0.45,
    volatilitySpike:
      Math.abs(spxMove) > 1.5 || Math.abs(indiaAvgMove) > 1.4 || Math.abs(btcMove) > 4,
    liquidityShock:
      pulse.indices.spx.change5d < -3 || pulse.indices.nifty.change5d < -3 || btcMove < -5,
    externalShock: usdInrMove > 0.8 || goldMove > 1.4,
  };

  const vixRisk = clamp((vixLevel - 14) * 2.2, 0, 35);
  const equityRisk = clamp(Math.max(0, -spxMove) * 8 + Math.max(0, -indiaAvgMove) * 8, 0, 30);
  const cryptoRisk = clamp(Math.max(0, -btcMove) * 1.8 + Math.max(0, -ethMove) * 1.2, 0, 20);
  const fxRisk = clamp(Math.max(0, usdInrMove) * 16, 0, 15);
  const marketRiskScore = Math.round(clamp(vixRisk + equityRisk + cryptoRisk + fxRisk, 0, 100));

  const usRisk = vixLevel > 30 ? "CRASH" : deriveRiskLevel(spxMove, -1.2, -2.3);
  const indiaRisk = deriveRiskLevel(indiaAvgMove, -1.0, -2.0);
  const cryptoRiskLevel = deriveRiskLevel((btcMove + ethMove) / 2, -1.8, -4.2);
  const globalRisk = deriveGlobalStatus(marketRiskScore);

  const activeFactors = Object.values(factors).filter(Boolean).length;
  const earlyWarning = activeFactors >= 2 && marketRiskScore < 66;
  const crashConfirmed = marketRiskScore >= 75 || (factors.volatilitySpike && factors.liquidityShock && factors.creditStress);

  const actions: string[] = [];
  if (marketRiskScore >= 70) {
    actions.push("Raise cash buffer and reduce leverage immediately.");
  }
  if (factors.creditStress) {
    actions.push("Cut exposure to weak-balance-sheet names and cyclical beta.");
  }
  if (factors.volatilitySpike) {
    actions.push("Use staggered orders and tighter risk limits intraday.");
  }
  if (factors.externalShock) {
    actions.push("Add USD and gold hedge allocation while macro stress persists.");
  }
  if (actions.length < 3) {
    actions.push("Rebalance weekly using live risk score and sector breadth changes.");
  }
  if (actions.length < 3) {
    actions.push("Avoid concentration in single themes until volatility cools.");
  }

  return {
    date: pulse.asOf || new Date().toISOString().split("T")[0],
    usRisk,
    indiaRisk,
    cryptoRisk: cryptoRiskLevel,
    globalRisk,
    riskJumpDay: marketRiskScore >= 58 && marketRiskScore < 75,
    crashConfirmed,
    earlyWarning,
    protectionScore: 100 - marketRiskScore,
    action: actions.slice(0, 3),
    factors,
  };
}

export default function DashboardPage() {
  const [today, setToday] = useState<string>("");
  const [pulse, setPulse] = useState<MarketPulse | null>(null);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [pulseError, setPulseError] = useState<string | null>(null);
  const router = useRouter();

  const data = useMemo(() => {
    if (!pulse) return null;
    return buildRealtimeRiskData(pulse);
  }, [pulse]);

  const marketRiskScore = data ? Math.max(0, 100 - data.protectionScore) : 0;
  const riskBand = marketRiskScore <= 35 ? "SAFE" : marketRiskScore <= 65 ? "CAUTION" : "HIGH RISK";
  const riskBandClass =
    marketRiskScore <= 35
      ? "bg-risk-low/20 text-risk-low border-risk-low/30"
      : marketRiskScore <= 65
        ? "bg-risk-elevated/20 text-risk-elevated border-risk-elevated/30"
        : "bg-risk-crash/20 text-risk-crash border-risk-crash/30";

  const activeAlertTriggers = data ? Object.values(data.factors).filter(Boolean).length : 0;

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );

    let mounted = true;
    async function fetchMarketPulse() {
      try {
        if (mounted && !pulse) setPulseLoading(true);
        const response = await fetch("/api/market-pulse", { cache: "no-store" });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || "Unable to load market data.");
        }
        if (mounted) {
          setPulse(json as MarketPulse);
          setPulseError(null);
          setPulseLoading(false);
        }
      } catch (error: any) {
        if (mounted) {
          setPulseError(error?.message || "Unable to load market data.");
          setPulseLoading(false);
        }
      }
    }

    fetchMarketPulse();
    const interval = setInterval(fetchMarketPulse, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 px-5 pt-8 pb-10">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground h-5">
            {today && (
              <>
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{today}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">CrashGuard</h1>
          {pulseError && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-risk-crash">
              Realtime feed unavailable.
            </p>
          )}
        </header>

        {data?.earlyWarning && (
          <div className="bg-risk-elevated/10 border border-risk-elevated/40 rounded-3xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-2 bg-risk-elevated/20 rounded-full text-risk-elevated">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-risk-elevated tracking-widest">Early Warning Mode</span>
              <p className="text-xs font-semibold text-white/90">Stress building in credit spreads. Prices not yet reacting.</p>
            </div>
          </div>
        )}

        {pulseLoading && !data ? (
          <div className="bg-card rounded-[2rem] border border-border p-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Realtime Signals</span>
          </div>
        ) : (
          <div data-tour-id="market-breakdown" className="grid grid-cols-2 gap-3">
            <RiskCard label="US Market" status={data?.usRisk || "ELEVATED"} />
            <RiskCard label="India Market" status={data?.indiaRisk || "ELEVATED"} />
            <RiskCard label="Crypto Assets" status={data?.cryptoRisk || "HIGH"} />
            <RiskCard label="Global System" status={data?.globalRisk || "FRAGILE"} />
          </div>
        )}

        <div data-tour-id="dashboard-cta">
          <button
            onClick={() => router.push("/scanner")}
            className="w-full bg-secondary/10 border border-secondary/30 rounded-[2rem] p-6 flex items-center justify-between group transition-all hover:bg-secondary/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-2xl text-secondary">
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-sm text-white">Portfolio Scanner</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diversify Smarter</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div data-tour-id="market-risk-score" className="bg-card rounded-[2.5rem] p-7 border border-border shadow-2xl space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Market Risk Score</span>
              <span className="text-3xl font-black text-white">{data ? `${marketRiskScore}/100` : "--/100"}</span>
            </div>
            <div className={cn("px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest", riskBandClass)}>
              {riskBand}
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={data ? marketRiskScore : 0} className="h-3" />
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic text-center">
              Green = Safe, Yellow = Caution, Red = High Risk. Current risk is derived from liquidity, volatility, and cross-market stress.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
            {marketRiskScore <= 35 ? <ShieldCheck className="w-3.5 h-3.5 text-risk-low" /> : <AlertTriangle className="w-3.5 h-3.5 text-risk-crash" />}
            <span>{data ? (marketRiskScore <= 35 ? "Defensive posture is healthy" : "Elevate defensive posture") : "Awaiting realtime metrics"}</span>
          </div>
        </div>

        <div data-tour-id="alerts-section" className="bg-card rounded-[2rem] p-6 border border-border space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Crash Alerts</span>
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
              activeAlertTriggers >= 2
                ? "bg-risk-elevated/20 text-risk-elevated border-risk-elevated/30"
                : "bg-muted/30 text-muted-foreground border-border"
            )}>
              {activeAlertTriggers >= 2 ? "Alert Armed" : "Monitoring"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Notifications are threshold-based. Alerts trigger when 2 or more stress factors turn active.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <AlertFlag label="Credit Stress" active={data?.factors.creditStress || false} />
            <AlertFlag label="Volatility Spike" active={data?.factors.volatilitySpike || false} />
            <AlertFlag label="Liquidity Shock" active={data?.factors.liquidityShock || false} />
            <AlertFlag label="External Shock" active={data?.factors.externalShock || false} />
          </div>
        </div>

        <div data-tour-id="recommended-actions" className="bg-card rounded-[2rem] p-6 border border-border space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recommended Actions</span>
          </div>
          <div className="space-y-2">
            {(data?.action || ["Waiting for realtime recommendation model..."]).map((action, index) => (
              <div key={action} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                <span className="mt-0.5 text-[10px] font-black text-secondary">{index + 1}.</span>
                <p className="text-xs text-white/90 font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/20 rounded-3xl p-6 border border-border/60">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Risk signals are based on credit spreads and liquidity depth. This app does not provide investment advice.
            </p>
          </div>
        </div>

        <footer className="mt-4 px-2 pb-6">
          <p className="text-[9px] text-muted-foreground/60 text-center leading-relaxed font-bold uppercase tracking-widest">
            Informational Tool Only - No Investment Advice
          </p>
        </footer>
      </div>

    </>
  );
}

function AlertFlag({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          active ? "text-risk-elevated" : "text-muted-foreground/70"
        )}
      >
        {active ? "On" : "Off"}
      </span>
    </div>
  );
}
