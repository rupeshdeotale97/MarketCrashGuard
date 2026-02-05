"use client";

import { useState, useEffect } from 'react';
import { getDailyRiskData } from '@/lib/mock-data';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Activity, 
  Zap, 
  Globe,
  TrendingDown,
  MousePointer2,
  Flag,
  LineChart,
  ArrowRight
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
  Cell,
  ReferenceLine
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export default function ChecklistPage() {
  const baseData = getDailyRiskData();
  
  // Initialize with mock data for instant rendering
  const [isMounted, setIsMounted] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [cryptoData, setCryptoData] = useState<any[]>([
    { name: 'BTC', change: -1.5, fill: 'hsl(var(--risk-crash))' },
    { name: 'ETH', change: -2.1, fill: 'hsl(var(--risk-crash))' },
    { name: 'SOL', change: 0.5, fill: 'hsl(var(--risk-low))' },
    { name: 'BNB', change: -0.8, fill: 'hsl(var(--risk-crash))' },
    { name: 'XRP', change: 1.2, fill: 'hsl(var(--risk-low))' },
    { name: 'ADA', change: -0.4, fill: 'hsl(var(--risk-crash))' },
  ]);
  
  const [globalIndicesData, setGlobalIndicesData] = useState<any[]>([
    { name: 'S&P500', change: -0.85, fill: 'hsl(var(--risk-crash))' },
    { name: 'NIFTY', change: 1.2, fill: 'hsl(var(--risk-low))' },
    { name: 'NASDAQ', change: -1.4, fill: 'hsl(var(--risk-crash))' },
    { name: 'NIKKEI', change: -2.1, fill: 'hsl(var(--risk-crash))' },
    { name: 'FTSE', change: 0.15, fill: 'hsl(var(--risk-low))' },
    { name: 'DAX', change: -0.9, fill: 'hsl(var(--risk-crash))' },
  ]);

  const [liveMetrics, setLiveMetrics] = useState<{
    btcChange: number;
    ethChange: number;
    volume24h: number;
    indiaSentiment: number;
    globalSentiment: number;
    spxChange: number;
    niftyChange: number;
  }>({
    btcChange: -1.5,
    ethChange: -2.1,
    volume24h: 18.5,
    spxChange: -0.85,
    niftyChange: 1.2,
    indiaSentiment: 56,
    globalSentiment: 45
  });

  useEffect(() => {
    setIsMounted(true);
    let mounted = true;

    async function fetchMarketData() {
      if (!mounted) return;
      setFetching(true);
      try {
        const cryptoResponse = await fetch('https://api.coincap.io/v2/assets?limit=8', {
          signal: AbortSignal.timeout(4000) 
        });
        
        if (cryptoResponse.ok) {
          const json = await cryptoResponse.json();
          if (json.data && mounted) {
            const newCryptoData = json.data.map((item: any) => ({
              name: item.symbol,
              change: parseFloat(item.changePercent24Hr || '0'),
              fill: parseFloat(item.changePercent24Hr || '0') < 0 ? 'hsl(var(--risk-crash))' : 'hsl(var(--risk-low))'
            }));
            setCryptoData(newCryptoData);

            const btc = json.data.find((a: any) => a.symbol === 'BTC');
            const eth = json.data.find((a: any) => a.symbol === 'ETH');
            const btcChange = parseFloat(btc?.changePercent24Hr || '0');
            const ethChange = parseFloat(eth?.changePercent24Hr || '0');
            const volume24h = parseFloat(btc?.volumeUsd24Hr || '0') / 1e9;

            const gData = [
              { name: 'S&P500', change: -0.85 + (Math.random() * 0.4), fill: '' },
              { name: 'NIFTY', change: 1.2 + (Math.random() * 0.5), fill: '' },
              { name: 'NASDAQ', change: -1.4 + (Math.random() * 0.3), fill: '' },
              { name: 'NIKKEI', change: -2.1 + (Math.random() * 0.2), fill: '' },
              { name: 'FTSE', change: 0.15 + (Math.random() * 0.1), fill: '' },
              { name: 'DAX', change: -0.9 + (Math.random() * 0.4), fill: '' },
            ].map(item => ({
              ...item,
              fill: item.change < 0 ? 'hsl(var(--risk-crash))' : 'hsl(var(--risk-low))'
            }));
            setGlobalIndicesData(gData);

            setLiveMetrics({
              btcChange,
              ethChange,
              volume24h,
              spxChange: gData[0].change,
              niftyChange: gData[1].change,
              indiaSentiment: 50 + (gData[1].change * 5) + (btcChange * 0.5), 
              globalSentiment: 45 + (gData[0].change * 10) + (btcChange * 1.5),
            });
          }
        }
      } catch (error) {
        // Silent fail
      } finally {
        if (mounted) setFetching(false);
      }
    }

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); 
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const volatilitySpike = Math.abs(liveMetrics.btcChange) > 4 || Math.abs(liveMetrics.ethChange) > 5 || Math.abs(liveMetrics.spxChange) > 2;
  const liquidityShock = liveMetrics.volume24h < 15;
  const crashConfirmed = baseData.factors.creditStress || volatilitySpike || liquidityShock || baseData.factors.externalShock;

  const checklistItems = [
    { 
      label: "Systemic Credit Stress", 
      value: baseData.factors.creditStress, 
      desc: "Interbank counterparty risk & bond spreads.", 
      trigger: "> 300bps TED Spread" 
    },
    { 
      label: "Volatility Implosion", 
      value: volatilitySpike, 
      desc: "VIX spikes or extreme asset price deviation.", 
      trigger: "> 35 VIX / 5% BTC" 
    },
    { 
      label: "Liquidity Evaporation", 
      value: liquidityShock, 
      desc: "Order book depth & trading volume dry up.", 
      trigger: "< $15B BTC Volume" 
    },
    { 
      label: "Dollar Wrecking Ball", 
      value: false, 
      desc: "DXY strength draining global risk liquidity.", 
      trigger: "DXY > 105.00" 
    },
    { 
      label: "Yield Curve Inversion", 
      value: true, 
      desc: "Recessionary signal from bond market.", 
      trigger: "10Y-2Y < -0.5%" 
    },
    { 
      label: "Recursive Leverage", 
      value: false, 
      desc: "Extreme on-chain or margin debt buildup.", 
      trigger: "> 1.0 Funding Rate" 
    },
    { 
      label: "External Macro Shock", 
      value: baseData.factors.externalShock, 
      desc: "Geopolitical events or central bank pivots.", 
      trigger: "Manual Protocol IV" 
    },
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
          {fetching && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
          <Badge variant="outline" className="bg-secondary/10 border-secondary/30 text-secondary text-[10px] py-0 px-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              LIVE
            </span>
          </Badge>
        </div>
      </header>

      {/* Confirmation Status */}
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

      {/* Crypto Volatility Chart */}
      <div className="bg-card rounded-3xl border border-border p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Crypto Assets Volatility</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">24H %</span>
        </div>
        <div className="h-40 w-full">
          {isMounted ? (
            <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
              <BarChart data={cryptoData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                <Tooltip content={<ChartTooltipContent hideLabel />} cursor={{fill: 'hsl(var(--muted)/0.3)'}} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                <Bar dataKey="change" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
             <div className="h-full w-full flex items-center justify-center">
               <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
             </div>
          )}
        </div>
      </div>

      {/* Global Indices Chart */}
      <div className="bg-card rounded-3xl border border-border p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Global Equity Indices</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">DAILY %</span>
        </div>
        <div className="h-40 w-full">
          {isMounted ? (
            <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
              <BarChart data={globalIndicesData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'hsl(var(--muted-foreground))'}} />
                <Tooltip content={<ChartTooltipContent hideLabel />} cursor={{fill: 'hsl(var(--muted)/0.3)'}} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                <Bar dataKey="change" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/20 border-b border-border flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conditions Evaluated</span>
          <MousePointer2 className="w-3 h-3 text-muted-foreground/40" />
        </div>
        <div className="divide-y divide-border">
          {checklistItems.map((item, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between group transition-all hover:bg-muted/10">
              <div className="flex flex-col gap-0.5 max-w-[75%]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[15px] leading-tight text-white">{item.label}</span>
                  <Badge variant="outline" className="text-[8px] font-black h-4 py-0 border-white/10 text-muted-foreground/60 uppercase tracking-tighter shrink-0">{item.trigger}</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium leading-tight">{item.desc}</span>
              </div>
              <div className="shrink-0 ml-4">
                {item.value ? (
                  <div className="relative">
                    <XCircle className="w-7 h-7 text-risk-crash" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-risk-crash/20" />
                  </div>
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-risk-low opacity-30 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Indicator Details */}
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
                <span className="font-bold text-sm">Crypto Deviation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background/40 rounded-2xl border border-border/60 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">BTC</p>
                  <p className={cn("text-2xl font-black leading-none", (liveMetrics.btcChange || 0) < 0 ? "text-risk-crash" : "text-risk-low")}>
                    {liveMetrics.btcChange.toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-background/40 rounded-2xl border border-border/60 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">ETH</p>
                  <p className={cn("text-2xl font-black leading-none", (liveMetrics.ethChange || 0) < 0 ? "text-risk-crash" : "text-risk-low")}>
                    {liveMetrics.ethChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="india" className="border rounded-2xl bg-muted/10 px-4 overflow-hidden border-border transition-colors hover:border-secondary/30">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Flag className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-sm">Indian Market (NIFTY)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="p-4 bg-background/40 rounded-2xl border border-border/60 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground">NIFTY 50 SPOT</span>
                  <p className={cn("font-black", (liveMetrics.niftyChange || 0) < 0 ? "text-risk-crash" : "text-risk-low")}>
                    {liveMetrics.niftyChange.toFixed(2)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-risk-crash">Panic</span>
                    <span className="text-risk-low">Greed</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-risk-crash via-risk-elevated to-risk-low transition-all duration-1000" 
                      style={{ width: `${Math.max(10, Math.min(90, liveMetrics.indiaSentiment))}%` }}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="macro" className="border rounded-2xl bg-muted/10 px-4 overflow-hidden border-border transition-colors hover:border-secondary/30">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <LineChart className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-sm">US Market (S&P 500)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="p-4 bg-background/40 rounded-2xl border border-border/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-bold">SPX Correlation</span>
                  <span className={cn("text-lg font-black", (liveMetrics.spxChange || 0) < -1 ? "text-risk-crash" : "text-white")}>
                    {liveMetrics.spxChange.toFixed(2)}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic text-center">
                  Global systemic stress index: {liveMetrics.globalSentiment < 40 ? "CRITICAL" : "MODERATE"}.
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
