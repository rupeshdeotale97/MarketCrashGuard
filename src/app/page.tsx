"use client";

import { useState, useEffect } from "react";
import { getDailyRiskData } from "@/lib/mock-data";
import { RiskCard } from "@/components/risk-card";
import {
  AlertTriangle,
  ShieldCheck,
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

export default function DashboardPage() {
  const [today, setToday] = useState<string>("");
  const data = getDailyRiskData();
  const router = useRouter();

  const marketRiskScore = Math.max(0, 100 - data.protectionScore);
  const riskBand = marketRiskScore <= 35 ? "SAFE" : marketRiskScore <= 65 ? "CAUTION" : "HIGH RISK";
  const riskBandClass =
    marketRiskScore <= 35
      ? "bg-risk-low/20 text-risk-low border-risk-low/30"
      : marketRiskScore <= 65
        ? "bg-risk-elevated/20 text-risk-elevated border-risk-elevated/30"
        : "bg-risk-crash/20 text-risk-crash border-risk-crash/30";

  const activeAlertTriggers = Object.values(data.factors).filter(Boolean).length;

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
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
        </header>

        {data.earlyWarning && (
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

        <div data-tour-id="market-breakdown" className="grid grid-cols-2 gap-3">
          <RiskCard label="US Market" status={data.usRisk} />
          <RiskCard label="India Market" status={data.indiaRisk} />
          <RiskCard label="Crypto Assets" status={data.cryptoRisk} />
          <RiskCard label="Global System" status={data.globalRisk} />
        </div>

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
              <span className="text-3xl font-black text-white">{marketRiskScore}/100</span>
            </div>
            <div className={cn("px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest", riskBandClass)}>
              {riskBand}
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={marketRiskScore} className="h-3" />
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic text-center">
              Green = Safe, Yellow = Caution, Red = High Risk. Current risk is derived from liquidity, volatility, and cross-market stress.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
            {marketRiskScore <= 35 ? <ShieldCheck className="w-3.5 h-3.5 text-risk-low" /> : <AlertTriangle className="w-3.5 h-3.5 text-risk-crash" />}
            <span>{marketRiskScore <= 35 ? "Defensive posture is healthy" : "Elevate defensive posture"}</span>
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
            <AlertFlag label="Credit Stress" active={data.factors.creditStress} />
            <AlertFlag label="Volatility Spike" active={data.factors.volatilitySpike} />
            <AlertFlag label="Liquidity Shock" active={data.factors.liquidityShock} />
            <AlertFlag label="External Shock" active={data.factors.externalShock} />
          </div>
        </div>

        <div data-tour-id="recommended-actions" className="bg-card rounded-[2rem] p-6 border border-border space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recommended Actions</span>
          </div>
          <div className="space-y-2">
            {data.action.map((action, index) => (
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
