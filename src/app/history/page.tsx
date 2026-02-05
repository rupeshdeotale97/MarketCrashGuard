"use client";

import { useState } from 'react';
import { 
  Calendar, 
  History, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldAlert, 
  TrendingDown,
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const historicalIntelligence = {
  '2008': {
    title: "The Great Financial Crisis",
    date: 'September 15, 2008',
    status: "SYSTEMIC COLLAPSE",
    stats: {
      peakDrawdown: "-56%",
      vixPeak: "80.86",
      recoveryTime: "1,576 Days",
      primaryTrigger: "Credit/Housing"
    },
    timeline: [
      { date: "March 2008", event: "Bear Stearns is sold to JPMorgan for $2/share.", impact: "Initial Stress" },
      { date: "Sept 7, 2008", event: "Fannie Mae & Freddie Mac are nationalized.", impact: "Liquidity Drain" },
      { date: "Sept 15, 2008", event: "Lehman Brothers files for Bankruptcy.", impact: "CRASH CONFIRMED" },
      { date: "Sept 16, 2008", event: "AIG bailout begins as credit markets freeze.", impact: "Systemic Contagion" }
    ],
    factors: [
      { name: "Credit Stress", level: "CRITICAL", desc: "TED Spread exceeded 300bps." },
      { name: "Volatility", level: "EXTREME", desc: "VIX doubled in 10 trading days." },
      { name: "Liquidity", level: "NONE", desc: "Interbank lending markets stopped." }
    ],
    lesson: "Credit stress is the ultimate lead indicator. Prices followed the credit freeze by 48-72 hours. Survival depended on having zero margin."
  },
  '2020': {
    title: "The COVID Liquidity Shock",
    date: 'March 12, 2020',
    status: "EXOGENOUS SHOCK",
    stats: {
      peakDrawdown: "-34%",
      vixPeak: "82.69",
      recoveryTime: "148 Days",
      primaryTrigger: "Global Lockdown"
    },
    timeline: [
      { date: "Feb 24, 2020", event: "First major gap down in S&P 500.", impact: "Early Warning" },
      { date: "March 9, 2020", event: "Oil prices crash 30% in a single day.", impact: "External Shock" },
      { date: "March 12, 2020", event: "The 'Everything' Sell-off: Gold & Bitcoin crash with stocks.", impact: "CRASH CONFIRMED" },
      { date: "March 23, 2020", event: "FED announces 'Unlimited QE' package.", impact: "Bottoming Signal" }
    ],
    factors: [
      { name: "Credit Stress", level: "MODERATE", desc: "Spreads jumped but FED intervened fast." },
      { name: "Volatility", level: "EXTREME", desc: "Fastest 30% drop in market history." },
      { name: "Liquidity", level: "CRITICAL", desc: "Dash for cash hit all asset classes." }
    ],
    lesson: "During a liquidity shock, correlations go to 1. Everything falls together. Only the Central Bank pivot marks the end of the panic."
  },
  '2022': {
    title: "The Crypto-Macro Deleveraging",
    date: 'May 12, 2022',
    status: "SPECULATIVE BUBBLE POP",
    stats: {
      peakDrawdown: "-77% (BTC)",
      vixPeak: "38.94",
      recoveryTime: "750+ Days",
      primaryTrigger: "Inflation/Rates"
    },
    timeline: [
      { date: "Nov 2021", event: "BTC hits ATH as FED signals rate hikes.", impact: "Cycle Peak" },
      { date: "May 9, 2022", event: "LUNA/UST stablecoin begins to de-peg.", impact: "Liquidity Event" },
      { date: "May 12, 2022", event: "LUNA goes to $0; recursive liquidations begin.", impact: "CRASH CONFIRMED" },
      { date: "Nov 2022", event: "FTX Exchange collapse marks the final washout.", impact: "Sentiment Bottom" }
    ],
    factors: [
      { name: "Credit Stress", level: "LOW", desc: "Traditional banks remained stable." },
      { name: "Volatility", level: "HIGH", desc: "Crypto-specific volatility spiked." },
      { name: "Liquidity", level: "EXTREME", desc: "Recursive selling in on-chain protocols." }
    ],
    lesson: "Leverage in recursive systems (like DeFi) collapses faster than traditional markets. The 'Risk Jump' happened when LUNA lost its peg."
  }
};

export default function HistoryPage() {
  const [activeYear, setActiveYear] = useState<'2008' | '2020' | '2022'>('2008');
  const history = historicalIntelligence[activeYear];

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">
            Intelligence Replay
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Historical Replay</h1>
        <p className="text-sm text-muted-foreground font-medium">Study past systemic collapses to build immunity.</p>
      </header>

      <Tabs defaultValue="2008" className="w-full" onValueChange={(v) => setActiveYear(v as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/20 p-1 h-12 rounded-2xl">
          <TabsTrigger value="2008" className="rounded-xl font-bold text-xs">2008 GFC</TabsTrigger>
          <TabsTrigger value="2020" className="rounded-xl font-bold text-xs">2020 COVID</TabsTrigger>
          <TabsTrigger value="2022" className="rounded-xl font-bold text-xs">2022 CRYPTO</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Executive Summary Card */}
          <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5">
               <History className="w-32 h-32" />
             </div>
             
             <div className="relative space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-secondary tracking-widest">{history.status}</span>
                  <h2 className="text-2xl font-black text-white">{history.title}</h2>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    System Failure Point: {history.date}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(history.stats).map(([label, val]) => (
                    <div key={label} className="bg-muted/10 p-4 rounded-2xl border border-border/40">
                      <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-wider mb-1">{label.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm font-black text-white">{val}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Clock className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Crisis Progression Timeline</h3>
            </div>
            
            <div className="space-y-3">
              {history.timeline.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-3 h-3 rounded-full shrink-0 border-2 mt-1.5",
                      item.impact === 'CRASH CONFIRMED' ? "bg-risk-crash border-risk-crash animate-pulse" : "bg-muted border-border"
                    )} />
                    {i !== history.timeline.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                  </div>
                  <div className="flex flex-col pb-4">
                    <span className="text-[10px] font-bold text-muted-foreground">{item.date}</span>
                    <span className="text-sm font-bold text-white group-hover:text-secondary transition-colors">{item.event}</span>
                    <Badge variant="outline" className={cn(
                      "w-fit mt-1 text-[8px] font-black h-4 px-1.5",
                      item.impact === 'CRASH CONFIRMED' ? "border-risk-crash/40 text-risk-crash" : "border-white/10 text-muted-foreground/60"
                    )}>
                      {item.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stress Factor Map */}
          <div className="bg-muted/10 rounded-[2rem] p-6 border border-border space-y-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Systemic Stress Map</h3>
            </div>
            <div className="space-y-4">
              {history.factors.map((factor, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-white">{factor.name}</span>
                    <span className={cn(
                      "text-[9px] font-black px-1.5 rounded",
                      factor.level === 'CRITICAL' || factor.level === 'EXTREME' ? "bg-risk-crash/20 text-risk-crash" : "bg-secondary/20 text-secondary"
                    )}>
                      {factor.level}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        factor.level === 'CRITICAL' || factor.level === 'EXTREME' ? "bg-risk-crash" : "bg-secondary"
                      )} 
                      style={{ width: factor.level === 'CRITICAL' || factor.level === 'EXTREME' ? '100%' : '60%' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium italic">{factor.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Lesson Card */}
          <div className="bg-secondary/10 border-2 border-secondary/20 rounded-[2rem] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-xl text-secondary">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Expert Post-Mortem</span>
            </div>
            <p className="text-xs leading-relaxed text-white/80 font-semibold italic">
              "{history.lesson}"
            </p>
          </div>
        </div>
      </Tabs>

      <footer className="mt-auto px-4 text-center">
        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.3em]">Institutional Grade Data • Educational Archive</p>
      </footer>
    </div>
  );
}
