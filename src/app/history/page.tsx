"use client";

import { useState } from 'react';
import { getHistoricalData } from '@/lib/mock-data';
import { Calendar, History, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HistoryPage() {
  const [activeYear, setActiveYear] = useState('2008');
  const history = getHistoricalData(activeYear);

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Historical Replay</h1>
        <p className="text-xs text-muted-foreground font-medium">Educational review of past systemic crises.</p>
      </header>

      <Tabs defaultValue="2008" className="w-full" onValueChange={setActiveYear}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/20 p-1 h-12 rounded-2xl">
          <TabsTrigger value="2008" className="rounded-xl font-bold text-xs">2008</TabsTrigger>
          <TabsTrigger value="2020" className="rounded-xl font-bold text-xs">2020</TabsTrigger>
          <TabsTrigger value="2022" className="rounded-xl font-bold text-xs">2022</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-card rounded-[2rem] p-6 border border-border shadow-xl space-y-6">
            <div className="flex items-center gap-3 text-secondary">
              <Calendar className="w-5 h-5" />
              <span className="font-black text-lg">{history.date}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatusBox label="System Status" value={history.globalRisk || ''} />
              <StatusBox label="Risk Jump Day" value={history.riskJumpDay ? "YES" : "NO"} highlight={history.riskJumpDay} />
              <StatusBox label="US Risk" value={history.usRisk || 'STABLE'} />
              <StatusBox label="Crash Confirmed" value={history.crashConfirmed ? "YES" : "NO"} highlight={history.crashConfirmed} />
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Shock Factors Detected</span>
              <div className="space-y-2">
                {Object.entries(history.factors || {}).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs font-bold py-2 border-b border-border/40 last:border-0">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    {val ? <AlertCircle className="w-4 h-4 text-risk-crash" /> : <CheckCircle2 className="w-4 h-4 text-risk-low" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-5 flex gap-3">
            <Info className="w-5 h-5 text-secondary shrink-0" />
            <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
              {activeYear === '2008' && "Lehman Brothers collapse triggered extreme credit stress spreads. Risk Jump Day occurred 48h before the final panic."}
              {activeYear === '2020' && "Liquidity shock was nearly instant. Global System risk jumped to STRESSED in a single week due to external shock."}
              {activeYear === '2022' && "A rotation-based crypto crash driven by volatility spikes and liquidity drain from risk-on assets."}
            </p>
          </div>
        </div>
      </Tabs>

      <footer className="mt-auto px-4 text-center">
        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Educational Data • Statically Mapped</p>
      </footer>
    </div>
  );
}

function StatusBox({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col bg-muted/10 p-4 rounded-2xl border border-border/40">
      <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-wider mb-1">{label}</span>
      <span className={cn("text-sm font-black", highlight ? "text-risk-crash" : "text-white")}>{value}</span>
    </div>
  );
}
