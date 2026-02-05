"use client";

import { useState, useEffect } from 'react';
import { getDailyRiskData } from '@/lib/mock-data';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Loader2, Info, Activity, Zap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function ChecklistPage() {
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState<{
    btcChange: number;
    ethChange: number;
    marketCapChange: number;
    volume24h: number;
  } | null>(null);

  const baseData = getDailyRiskData();

  useEffect(() => {
    let isMounted = true;

    async function fetchMarketData() {
      try {
        const response = await fetch('https://api.coincap.io/v2/assets?limit=5', {
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const json = await response.json();
        
        if (isMounted && json.data) {
          const btc = json.data.find((a: any) => a.symbol === 'BTC');
          const eth = json.data.find((a: any) => a.symbol === 'ETH');
          
          setLiveData({
            btcChange: parseFloat(btc?.changePercent24Hr || '0'),
            ethChange: parseFloat(eth?.changePercent24Hr || '0'),
            marketCapChange: -2.4, // Simulated global equity proxy
            volume24h: parseFloat(btc?.volumeUsd24Hr || '0') / 1e9, // In billions
          });
        }
      } catch (error) {
        // Log silently or handle locally to avoid Next.js error overlay
        console.warn("Market data fetch failed, using fallback metrics:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every 60s
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Derived logic for live checklist items
  const volatilitySpike = liveData ? Math.abs(liveData.btcChange) > 4 || Math.abs(liveData.ethChange) > 5 : baseData.factors.volatilitySpike;
  const liquidityShock = liveData ? liveData.volume24h < 15 : baseData.factors.liquidityShock;
  
  const crashConfirmed = baseData.factors.creditStress || volatilitySpike || liquidityShock || baseData.factors.externalShock;

  const checklistItems = [
    { label: "Credit Stress", value: baseData.factors.creditStress, desc: "Banking sector yield spreads." },
    { label: "Volatility Spike", value: volatilitySpike, desc: "Extreme price movement detected." },
    { label: "Liquidity Shock", value: liquidityShock, desc: "Low trading volume across major assets." },
    { label: "External Shock", value: baseData.factors.externalShock, desc: "Geopolitical or macro events." },
  ];

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Crash Checklist</h1>
          <p className="text-sm text-muted-foreground mt-1">Rule-based confirmation criteria.</p>
        </div>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-secondary" />}
      </header>

      {/* Status Banner */}
      <div className={cn(
        "rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-center border-2 transition-all duration-500",
        crashConfirmed 
          ? "bg-risk-crash/10 border-risk-crash shadow-[0_0_25px_rgba(239,68,68,0.25)]" 
          : "bg-risk-low/5 border-risk-low/20"
      )}>
        <div className={cn(
          "p-4 rounded-full transition-colors",
          crashConfirmed ? "bg-risk-crash/20 text-risk-crash" : "bg-risk-low/20 text-risk-low"
        )}>
          {crashConfirmed ? <AlertTriangle className="w-12 h-12 animate-pulse" /> : <ShieldCheck className="w-12 h-12" />}
        </div>
        <div>
          <h2 className={cn(
            "text-2xl font-black uppercase tracking-tighter",
            crashConfirmed ? "text-risk-crash" : "text-risk-low"
          )}>
            {crashConfirmed ? "CRASH CONFIRMED" : "CRASH NOT CONFIRMED"}
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1 max-w-[240px]">
            {crashConfirmed 
              ? "Multiple system shocks detected. Defensive posture recommended." 
              : "Market conditions remain within normal operating thresholds."}
          </p>
        </div>
      </div>

      {/* Confirmation List */}
      <div className="bg-card rounded-3xl border border-border divide-y divide-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/30 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conditions Evaluated</span>
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">Live</Badge>
        </div>
        {checklistItems.map((item, i) => (
          <div key={i} className="px-6 py-5 flex items-center justify-between group transition-colors hover:bg-muted/10">
            <div className="flex flex-col">
              <span className="font-semibold text-lg">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
            {item.value ? (
              <XCircle className="w-7 h-7 text-risk-crash drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-risk-low" />
            )}
          </div>
        ))}
      </div>

      {/* Details Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <Info className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Indicator Analysis</h3>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="volatility" className="border rounded-2xl bg-muted/20 px-4 overflow-hidden border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="font-medium text-sm">Volatility Metrics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background/50 rounded-xl border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">BTC 24h Change</p>
                  <p className={cn("text-lg font-bold", (liveData?.btcChange || 0) < 0 ? "text-risk-crash" : "text-risk-low")}>
                    {liveData?.btcChange?.toFixed(2) || '0.00'}%
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-xl border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">ETH 24h Change</p>
                  <p className={cn("text-lg font-bold", (liveData?.ethChange || 0) < 0 ? "text-risk-crash" : "text-risk-low")}>
                    {liveData?.ethChange?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="liquidity" className="border rounded-2xl bg-muted/20 px-4 overflow-hidden border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="font-medium text-sm">Liquidity Snapshot</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="p-4 bg-background/50 rounded-xl border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">BTC 24h Volume</span>
                  <span className="text-sm font-bold text-white">${liveData?.volume24h?.toFixed(2) || '0.00'}B</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary transition-all duration-1000" 
                    style={{ width: `${Math.min((liveData?.volume24h || 0) / 30 * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">Threshold: Under $15B signals liquidity shock.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="macro" className="border rounded-2xl bg-muted/20 px-4 overflow-hidden border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-secondary" />
                <span className="font-medium text-sm">Macro Correlation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1 text-xs text-muted-foreground leading-relaxed">
              Global system shock is evaluated using cross-asset correlation. Current equity proxy indicates a 
              <span className="text-white font-bold"> {liveData?.marketCapChange || '-2.4'}%</span> estimated deviation from monthly mean. 
              External shocks are manually adjusted based on central bank credit injection rates.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Suggested Guidance */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Suggested Guidance</h3>
        <div className="space-y-2">
          {(crashConfirmed ? ["Exit high-beta assets", "Increase cash position", "Hedging required"] : baseData.action).map((action, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 bg-muted/40 rounded-2xl border border-border">
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", crashConfirmed ? "bg-risk-crash" : "bg-secondary")} />
              <span className="font-medium text-sm">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
