"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  ShieldAlert, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  Layers, 
  Clock,
  ArrowRightCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const playbooks = [
  {
    id: "equity",
    title: "Equity Market Crash",
    subtitle: "Systemic Deleveraging",
    description: "Broad-based decline in global indices driven by earnings contraction or macro shocks.",
    riskLevel: "CRITICAL",
    precedents: "2000 Dot-com, 2008 GFC, 2020 COVID",
    whatToDo: [
      "Move to defensive sectors (Utilities, Healthcare)",
      "Rebalance into high-quality dividend payers",
      "Monitor the 200-day moving average daily"
    ],
    whatNotToDo: [
      "Panic sell fundamentally strong companies",
      "Average down on high-beta tech stocks",
      "Ignore rising credit default swaps (CDS)"
    ],
    survivalChecklist: [
      "Verify 6-month cash runway",
      "Audit all margin/leverage positions",
      "Set hard stop-losses on speculative tiers"
    ],
    recoverySignals: [
      "VIX volatility index drops below 20",
      "Credit spreads begin to narrow for 3 consecutive weeks",
      "Central bank pivot or liquidity injection confirmed"
    ],
    correlation: "Highly correlated to High-Yield Debt and Crypto.",
    duration: "6 to 18 months."
  },
  {
    id: "crypto",
    title: "Crypto Liquidity Event",
    subtitle: "Recursive Liquidation",
    description: "Rapid collapse in digital asset prices often caused by exchange failure or stablecoin de-pegging.",
    riskLevel: "EXTREME",
    precedents: "2018 Winter, 2022 Luna/FTX",
    whatToDo: [
      "Move assets to cold storage immediately",
      "Consolidate into BTC and ETH dominance",
      "Check stablecoin collateral transparency"
    ],
    whatNotToDo: [
      "Chasing 'dead cat bounces' with leverage",
      "Keeping funds on smaller, off-shore exchanges",
      "Panic swapping into unverified algorithmic stables"
    ],
    survivalChecklist: [
      "Revoke all unnecessary smart contract permissions",
      "Check hardware wallet firmware updates",
      "Monitor exchange inflow/outflow data"
    ],
    recoverySignals: [
      "Exchange stablecoin reserves begin to rise",
      "Funding rates reset to neutral or negative",
      "On-chain 'Realized Cap' stabilizes"
    ],
    correlation: "Strongly tied to Nasdaq (QQQ) and USD Index (DXY).",
    duration: "3 to 9 months of high intensity."
  },
  {
    id: "liquidity",
    title: "Global Liquidity Shock",
    subtitle: "The 'Everything' Sell-off",
    description: "A 'dash for cash' where all asset classes (including gold) fall as investors meet margin calls.",
    riskLevel: "SYSTEMIC",
    precedents: "March 2020, Sept 2008",
    whatToDo: [
      "Cash is the only safe harbor - raise liquidity",
      "Short-term government bonds (T-Bills)",
      "Wait for the 'Volatile Washout' candle"
    ],
    whatNotToDo: [
      "Buying the first 10% dip",
      "Fighting the Federal Reserve/Central Banks",
      "Assuming 'Safe Havens' will hold early on"
    ],
    survivalChecklist: [
      "Calculate liquidation price on all loans",
      "Consolidate multiple brokerage accounts",
      "Identify the 'Bottom Fish' list for later"
    ],
    recoverySignals: [
      "USD Index (DXY) begins to weaken significantly",
      "Repo market rates return to normal levels",
      "Gold begins to out-perform equities again"
    ],
    correlation: "Inverse to the US Dollar; matches all risk assets.",
    duration: "Short but violent (1 to 4 months)."
  }
];

export default function PlaybooksPage() {
  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">
            Premium Intelligence
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Crash Playbooks</h1>
        <p className="text-sm text-muted-foreground font-medium">Professional guidance for extreme market regimes.</p>
      </header>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {playbooks.map((book) => (
            <AccordionItem 
              key={book.id} 
              value={book.id} 
              className="border rounded-[2rem] bg-card px-0 overflow-hidden border-border transition-all hover:border-secondary/30 shadow-2xl"
            >
              <AccordionTrigger className="hover:no-underline py-6 px-6">
                <div className="flex items-center gap-4 text-left">
                  <div className={cn(
                    "p-3 rounded-2xl shrink-0",
                    book.riskLevel === 'EXTREME' ? "bg-risk-crash/10 text-risk-crash" : "bg-secondary/10 text-secondary"
                  )}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-white">{book.title}</span>
                      <Badge variant="outline" className="text-[8px] font-black h-4 py-0 border-white/10 text-muted-foreground">
                        {book.riskLevel}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{book.subtitle}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 px-6 space-y-8">
                {/* Executive Summary */}
                <div className="bg-muted/20 rounded-2xl p-4 border border-border/40">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    <span className="text-white font-bold not-italic mr-1">Context:</span> 
                    {book.description} Historical precedents include {book.precedents}.
                  </p>
                </div>

                {/* Strategy Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-risk-low border-b border-risk-low/10 pb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Defensive Actions</span>
                    </div>
                    <ul className="space-y-2">
                      {book.whatToDo.map((item, i) => (
                        <li key={i} className="flex gap-2 text-[11px] font-semibold text-white/80 leading-tight">
                          <span className="text-risk-low">→</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-risk-crash border-b border-risk-crash/10 pb-2">
                      <XCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Fatal Mistakes</span>
                    </div>
                    <ul className="space-y-2">
                      {book.whatNotToDo.map((item, i) => (
                        <li key={i} className="flex gap-2 text-[11px] font-semibold text-white/80 leading-tight">
                          <span className="text-risk-crash">✕</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Premium Intelligence Sections */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Recovery Signals</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {book.recoverySignals.map((signal, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/10 rounded-xl p-3 border border-border/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        <span className="text-[11px] font-medium text-muted-foreground">{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Survival Checklist & Macro Data */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Survival Checklist</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {book.survivalChecklist.map((task, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded border border-secondary/40 flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-sm bg-secondary/20" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/70">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 px-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Average Duration</span>
                      </div>
                      <span className="text-white">{book.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Correlation Risk</span>
                      </div>
                      <span className="text-white text-right max-w-[150px] leading-tight">{book.correlation}</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary flex items-center justify-center gap-2 transition-all">
                  <ArrowRightCircle className="w-4 h-4" />
                  Mark as Read & Understood
                </button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="bg-muted/10 rounded-[2rem] p-6 border border-dashed border-border mt-4 flex flex-col items-center gap-4 text-center">
        <div className="p-3 bg-background rounded-full border border-border shadow-inner">
          <BookOpen className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground leading-relaxed font-bold italic">
            "The goal of the playbook is not to predict the rain, but to build an ark before it starts."
          </p>
          <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/30">— Risk Management Axiom</span>
        </div>
      </div>
    </div>
  );
}
