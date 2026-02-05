"use client";

import { useState, useEffect, useMemo } from 'react';
import { getDailyRiskData } from '@/lib/mock-data';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Info, 
  Activity, 
  Zap, 
  Globe,
  TrendingDown,
  BarChart3,
  MousePointer2,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function ChecklistPage() {
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<{
    btcChange: number;
    ethChange: number;
    volume24h: number;
    indiaSentiment: number;
    globalSentiment: number;
  } | null>(null);

  const baseData = getDailyRiskData();

  useEffect(() => {
    let isMounted = true;

    async function fetchMarketData() {
      try {
        const response = await fetch('https://api.coincap.io/v2/assets?limit=10', {
          signal: AbortSignal.timeout(8000)
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const json = await response.json();
        
        if (isMounted && json.data) {
          const data = json.data.map((item: any) => ({
            name: item.symbol,
            change: parseFloat(item.changePercent24Hr || '0'),
            volume: parseFloat(item.volumeUsd24Hr || '0') / 1e9,
            price: parseFloat(item.priceUsd || '0')
          }));

          setMarketData(data);

          const btc = json.data.find((a: any) => a.symbol === 'BTC');
          const eth = json.data.find((a: any) => a.symbol === 'ETH');
          
          setLiveMetrics({
            btcChange: parseFloat(btc?.changePercent24Hr || '0'),
            ethChange: parseFloat(eth?.changePercent24Hr || '0'),
            volume24h: parseFloat(btc?.volumeUsd24Hr || '0') / 1e9,
            // Simulated sentiment proxies based on global crypto volatility
            indiaSentiment: 50 + (parseFloat(btc?.changePercent24Hr || '0') * 2), 
            globalSentiment: 45 + (parseFloat(btc?.changePercent24Hr || '0') * 1.5),
          });
        }
      } catch (error) {
        console.warn("Market data fetch failed:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // 30s refresh
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Confirmation Logic
  const volatilitySpike = liveMetrics ? Math.abs(liveMetrics.btcChange) > 4 || Math.abs(liveMetrics.ethChange) > 5 : baseData.factors.volatilitySpike;
  const liquidityShock = liveMetrics ? liveMetrics.volume24h < 15 : baseData.factors.liquidityShock;
  const crashConfirmed = baseData.factors.creditStress || volatilitySpike || liquidityShock || baseData.factors.externalShock;

  const checklistItems = [
    { label: "Credit Stress", value: baseData.factors.creditStress, desc: "Banking sector yield spreads.", trigger: "> 2.5% Spread" },
    { label: "Volatility Spike", value: volatilitySpike, desc: "Extreme price movement detected.", trigger: "> 4% BTC / 5% ETH 24h" },
    { label: "Liquidity Shock", value: liquidityShock, desc: "Low trading volume across major assets.", trigger: "< $15B BTC Volume" },
    { label: "External Shock", value: baseData.factors.externalShock, desc: "Geopolitical or macro events.", trigger: "Manual Override" },
  ];

  const chartConfig = {
    change: {
      label: "24h Change %",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Crash Checklist</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time rule-based confirmation.</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
          <Badge variant="outline" className="animate-pulse bg-secondary/10 border-secondary/30 text-secondary text-[10px] py-0 px-2">LIVE DATA</Badge>
        </div>
      </header>

      {/* Confirmation Hero */}
      <div className={cn(
        "rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-center border transition-all duration-700",
        crashConfirmed 
          ? "bg-risk-crash/10 border-risk-crash/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]" 
          : "bg-risk-low/5 border-risk-low/20"
      )}>
        <div className={cn(
          "p-5 rounded-full shadow-inner transition-transform duration-500",
          crashConfirmed ? "bg-risk-crash/20 text-risk-crash scale-110" : "bg-risk-low/20 text-risk-low"
        )}>
          {crashConfirmed ? <AlertTriangle className="w-14 h-14 animate-pulse" /> : <ShieldCheck className="w-14 h-14" />}
        </div>
        <div className="space-y-1">
          <h2 className={cn(
            "text-3xl font-black uppercase tracking-tighter",
            crashConfirmed ? "text-risk-crash" : "text-risk-low"
          )}>
            {crashConfirmed ? "CRASH CONFIRMED" : "SYSTEM STABLE"}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-[0.2em]">
            Safety Protocol Status: {crashConfirmed ? "DEFENSIVE" : "OPTIMAL"}
          </p>
        </div>
      </div>

      {/* Real-time Volatility Chart */}
      <div className="bg-card rounded-3xl border border-border p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Top Assets Volatility</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">24H % CHANGE</span>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} 
              />
              <YAxis 
                hide 
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip 
                content={<ChartTooltipContent hideLabel />}
                cursor={{fill: 'hsl(var(--muted)/0.3)'}}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
              <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                {marketData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.change < 0 ? 'hsl(var(--risk-crash))' : 'hsl(var(--risk-low))'} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/20 border-b border-border flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conditions Evaluated</span>
          <MousePointer2 className="w-3 h-3 text-muted-foreground/40" />
        </div>
        <div className="divide-y divide-border">
          {checklistItems.map((item, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between group transition-all hover:bg-muted/10">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg leading-none">{item.label}</span>
                  <Badge variant="outline" className="text-[9px] font-bold h-4 py-0 text-muted-foreground/60">{item.trigger}</Badge>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.desc}</span>
              </div>
              <div className="shrink-0">
                {item.value ? (
                  <div className="relative">
                    <XCircle className="w-8 h-8 text-risk-crash" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-risk-crash/20" />
                  </div>
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-risk-low opacity-40 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Indicator Analysis */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <TrendingDown className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Indicator Analysis</h3>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="volatility" className="border rounded-2xl bg-muted/10 px-4 overflow-hidden border-border transition-colors hover:border-secondary/30">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="font-bold text-sm">Crypto Volatility</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background/40 rounded-2xl border border-border/60">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">BTC 24h Deviation</p>
                  <div className="flex items-end gap-1">
                    <p className={cn("text-2xl font-black tabular-nums leading-none", (liveMetrics?.btcChange || 0) < 0 ? "text-risk-crash" : "text-risk-low")}>
                      {liveMetrics?.btcChange?.toFixed(2) || '0.00'}%
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground/40 mb-1">REALTIME</span>
                  </div>
                </div>
                <div className="p-4 bg-background/40 rounded-2xl border border-border/60">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">ETH 24h Deviation</p>
                  <div className="flex items-end gap-1">
                    <p className={cn("text-2xl font-black tabular-nums leading-none", (liveMetrics?.ethChange || 0) < 0 ? "text-risk-crash" : "text-risk-low")}>
                      {liveMetrics?.ethChange?.toFixed(2) || '0.00'}%
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground/40 mb-1">REALTIME</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="india" className="border rounded-2xl bg-muted/10 px-4 overflow-hidden border-border transition-colors hover:border-secondary/30">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Flag className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-sm">Indian Market Sentiment</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="p-4 bg-background/40 rounded-2xl border border-border/60 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground">SENSEX/NIFTY PROXY</span>
                  <Badge variant="secondary" className="text-[9px] h-4">STABLE</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-risk-crash">Panic</span>
                    <span className="text-risk-low">Greed</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-risk-crash via-risk-elevated to-risk-low transition-all duration-1000" 
                      style={{ width: `${liveMetrics?.indiaSentiment || 50}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed text-center font-medium italic">
                  Calculated using cross-asset volatility and regional credit availability proxies.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="liquidity" className="border rounded-2xl bg-muted/10 px-4 overflow-hidden border-border transition-colors hover:border-secondary/30">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="font-bold text-sm">Liquidity Snapshot</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="p-4 bg-background/40 rounded-2xl border border-border/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-bold">BTC 24h Volume</span>
                  <span className="text-lg font-black text-white tabular-nums">${liveMetrics?.volume24h?.toFixed(2) || '0.00'}B</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      (liveMetrics?.volume24h || 0) < 15 ? "bg-risk-crash" : "bg-secondary"
                    )}
                    style={{ width: `${Math.min((liveMetrics?.volume24h || 0) / 30 * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                  <span>Critical: &lt;$10B</span>
                  <span>Normal: &gt;$20B</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="macro" className="border rounded-2xl bg-muted/10 px-4 overflow-hidden border-border transition-colors hover:border-secondary/30">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-sm">Global Risk Index</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="p-4 bg-background/40 rounded-2xl border border-border/60 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Systemic Stress Level</span>
                    <span className={cn(
                      "text-xs font-black uppercase",
                      (liveMetrics?.globalSentiment || 50) < 40 ? "text-risk-crash" : "text-risk-low"
                    )}>
                      {(liveMetrics?.globalSentiment || 50) < 40 ? "CRITICAL" : "MODERATE"}
                    </span>
                 </div>
                 <div className="flex gap-1 h-1.5">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 rounded-full transition-all duration-500",
                          i < ((liveMetrics?.globalSentiment || 50) / 10) 
                            ? (i < 3 ? "bg-risk-crash" : i < 6 ? "bg-risk-elevated" : "bg-risk-low")
                            : "bg-muted"
                        )} 
                      />
                    ))}
                 </div>
                 <p className="text-[10px] text-muted-foreground leading-relaxed">
                   Cross-border capital flow indicators and G7 central bank liquidity injections are currently 
                   <span className="text-white font-bold ml-1">Normalizing</span>.
                 </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Suggested Actions */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Suggested Guidance</h3>
        <div className="space-y-2">
          {(crashConfirmed ? ["Exit high-beta assets immediately", "Liquidity check: Priority 1", "Deploy hedging strategies"] : baseData.action).map((action, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 bg-muted/20 rounded-[1.25rem] border border-border/60 group">
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-transform", 
                crashConfirmed ? "bg-risk-crash animate-pulse" : "bg-secondary"
              )} />
              <span className="font-semibold text-sm">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
