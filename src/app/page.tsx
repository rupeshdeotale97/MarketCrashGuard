"use client";

import { useState, useEffect } from 'react';
import { getDailyRiskData } from '@/lib/mock-data';
import { RiskCard } from '@/components/risk-card';
import { AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [today, setToday] = useState<string>("");
  const data = getDailyRiskData();

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }));
  }, []);

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      {/* Header Section */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground h-5">
          {today && (
            <>
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-widest">{today}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">CrashGuard</h1>
      </header>

      {/* Main Indicators Grid */}
      <div className="grid grid-cols-2 gap-4">
        <RiskCard label="US Market" status={data.usRisk} />
        <RiskCard label="India Market" status={data.indiaRisk} />
        <RiskCard label="Crypto" status={data.cryptoRisk} />
        <RiskCard label="Global System" status={data.globalRisk} />
      </div>

      {/* Risk Jump Banner */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-6 border shadow-lg transition-all",
        data.riskJumpDay 
          ? "bg-risk-high/10 border-risk-high/30" 
          : "bg-risk-low/10 border-risk-low/30"
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">Signal Alert</span>
            <span className="text-xl font-bold">RISK JUMP DAY: {data.riskJumpDay ? "YES" : "NO"}</span>
          </div>
          <div className={cn(
            "p-3 rounded-full",
            data.riskJumpDay ? "bg-risk-high/20 text-risk-high" : "bg-risk-low/20 text-risk-low"
          )}>
            <AlertCircle className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Dashboard Summary Footer */}
      <div className="bg-card rounded-3xl p-6 border border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          The dashboard provides real-time rule-based alerts for market volatility and credit stress. Check the <span className="text-secondary font-semibold">Checklist</span> tab for detailed system shock analysis.
        </p>
      </div>

      {/* Disclaimer Snippet */}
      <footer className="mt-4 px-2">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          This app does not provide investment advice. Data is purely rule-based for awareness.
        </p>
      </footer>
    </div>
  );
}
