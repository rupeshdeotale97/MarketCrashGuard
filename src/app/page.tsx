"use client";

import { useState, useEffect } from 'react';
import { getDailyRiskData } from '@/lib/mock-data';
import { RiskCard } from '@/components/risk-card';
import { AlertTriangle, ShieldCheck, Calendar, Info, Zap, Scan, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [today, setToday] = useState<string>("");
  const data = getDailyRiskData();
  const router = useRouter();

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }));
  }, []);

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-10">
      {/* Header Section */}
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

      {/* Early Warning Banner */}
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

      {/* Main Indicators Grid */}
      <div className="grid grid-cols-2 gap-3">
        <RiskCard label="US Market" status={data.usRisk} />
        <RiskCard label="India Market" status={data.indiaRisk} />
        <RiskCard label="Crypto Assets" status={data.cryptoRisk} />
        <RiskCard label="Global System" status={data.globalRisk} />
      </div>

      {/* Portfolio Scanner Entry */}
      <button 
        onClick={() => router.push('/scanner')}
        className="bg-secondary/10 border border-secondary/30 rounded-[2rem] p-6 flex items-center justify-between group transition-all hover:bg-secondary/20"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/20 rounded-2xl text-secondary">
            <Scan className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-black text-sm text-white">Portfolio Scanner</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Analyze Alignment</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-secondary group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Capital Protection Score */}
      <div className="bg-card rounded-[2.5rem] p-7 border border-border shadow-2xl space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protection Score</span>
            <span className="text-3xl font-black text-white">{data.protectionScore}/100</span>
          </div>
          <div className={cn(
            "p-3 rounded-full",
            data.protectionScore > 70 ? "bg-risk-low/20 text-risk-low" : "bg-risk-high/20 text-risk-high"
          )}>
            {data.protectionScore > 70 ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={data.protectionScore} className="h-3" />
          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic text-center">
            Your capital is currently {data.protectionScore > 70 ? "well-protected" : "moderately exposed"}. System liquidity is {data.globalRisk === 'STABLE' ? 'healthy' : 'tightening'}.
          </p>
        </div>
      </div>

      {/* Dashboard Summary */}
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
          Informational Tool Only • No Investment Advice
        </p>
      </footer>
    </div>
  );
}
