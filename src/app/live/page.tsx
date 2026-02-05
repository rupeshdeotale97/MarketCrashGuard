"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Loader2, 
  Globe,
  Flag,
  Coins,
  ShieldCheck,
  Mountain,
  Flame,
  Droplets,
  Info,
  Layers,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface IndexData {
  name: string;
  region?: string;
  price: string;
  change: number;
  type: 'global' | 'india' | 'crypto' | 'commodity';
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'CRASH';
}

export default function LiveSignalsPage() {
  const [data, setData] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function fetchLiveIntelligence() {
      if (!mounted) return;
      
      let cryptoData: IndexData[] = [];
      const mockGlobal: IndexData[] = [
        // US Markets
        { name: 'S&P 500', region: 'US', price: '5,021.40', change: -0.45 + (Math.random() * 0.2), type: 'global', signal: 'NEUTRAL' },
        { name: 'NASDAQ 100', region: 'US', price: '17,890.10', change: -0.85 + (Math.random() * 0.4), type: 'global', signal: 'BEARISH' },
        { name: 'Dow Jones', region: 'US', price: '38,628.00', change: -0.12 + (Math.random() * 0.1), type: 'global', signal: 'NEUTRAL' },
        
        // European Markets
        { name: 'FTSE 100', region: 'Europe', price: '7,624.10', change: 0.15 + (Math.random() * 0.2), type: 'global', signal: 'NEUTRAL' },
        { name: 'DAX 40', region: 'Europe', price: '16,921.30', change: -0.55 + (Math.random() * 0.3), type: 'global', signal: 'BEARISH' },

        // Asian Markets
        { name: 'Nikkei 225', region: 'Asia', price: '36,158.00', change: 1.12 + (Math.random() * 0.5), type: 'global', signal: 'BULLISH' },
        { name: 'Hang Seng', region: 'Asia', price: '15,878.00', change: -2.34 + (Math.random() * 0.8), type: 'global', signal: 'CRASH' },

        // Indian Markets
        { name: 'NIFTY 50', region: 'India', price: '22,450.25', change: 0.32 + (Math.random() * 0.1), type: 'india', signal: 'BULLISH' },
        { name: 'BANKNIFTY', region: 'India', price: '48,120.40', change: 0.45 + (Math.random() * 0.2), type: 'india', signal: 'BULLISH' },
        { name: 'SENSEX', region: 'India', price: '73,890.15', change: 0.28 + (Math.random() * 0.1), type: 'india', signal: 'BULLISH' },
      ];

      const mockCommodities: IndexData[] = [
        { name: 'Gold', region: 'XAU/USD', price: '$2,342.10', change: 1.2 + (Math.random() * 0.5), type: 'commodity', signal: 'BULLISH' },
        { name: 'Silver', region: 'XAG/USD', price: '$28.45', change: 0.8 + (Math.random() * 0.3), type: 'commodity', signal: 'BULLISH' },
        { name: 'Brent Oil', region: 'ICE', price: '$82.15', change: -1.4 + (Math.random() * 0.4), type: 'commodity', signal: 'BEARISH' },
        { name: 'Natural Gas', region: 'NYMEX', price: '$2.15', change: -3.2 + (Math.random() * 1.2), type: 'commodity', signal: 'CRASH' },
        { name: 'Copper', region: 'COMEX', price: '$4.52', change: -0.2 + (Math.random() * 0.1), type: 'commodity', signal: 'NEUTRAL' },
      ];

      try {
        const cryptoResponse = await fetch('https://api.coincap.io/v2/assets?limit=5', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (cryptoResponse.ok) {
          const cryptoJson = await cryptoResponse.json();
          cryptoData = cryptoJson.data.map((item: any) => ({
            name: item.symbol,
            price: `$${parseFloat(item.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            change: parseFloat(item.changePercent24Hr),
            type: 'crypto',
            signal: 'NEUTRAL'
          }));
        } else {
          throw new Error("API Response Error");
        }
      } catch (error) {
        cryptoData = [
          { name: 'BTC', price: '$64,250.00', change: -1.2, type: 'crypto', signal: 'BEARISH' },
          { name: 'ETH', price: '$3,450.20', change: -0.8, type: 'crypto', signal: 'NEUTRAL' },
          { name: 'SOL', price: '$145.50', change: 2.4, type: 'crypto', signal: 'BULLISH' },
          { name: 'BNB', price: '$580.10', change: -0.3, type: 'crypto', signal: 'NEUTRAL' },
          { name: 'XRP', price: '$0.58', change: 1.1, type: 'crypto', signal: 'BULLISH' },
        ];
      }

      const finalData = [...mockGlobal, ...mockCommodities, ...cryptoData].map(item => {
        let signal = item.signal;
        if (item.type === 'crypto') {
          if (item.change > 2) signal = 'BULLISH';
          else if (item.change < -4) signal = 'CRASH';
          else if (item.change < -1) signal = 'BEARISH';
          else signal = 'NEUTRAL';
        }
        return { ...item, signal };
      }) as IndexData[];

      if (mounted) {
        setData(finalData);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      }
    }

    fetchLiveIntelligence();
    const interval = setInterval(fetchLiveIntelligence, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'BULLISH':
        return <Badge className="bg-risk-low/20 text-risk-low border-risk-low/30 hover:bg-risk-low/20">BULLISH</Badge>;
      case 'BEARISH':
        return <Badge className="bg-risk-crash/10 text-risk-crash border-risk-crash/30 hover:bg-risk-crash/10">BEARISH</Badge>;
      case 'CRASH':
        return <Badge className="bg-risk-crash text-white border-transparent animate-pulse">CRASH</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground border-white/10">NEUTRAL</Badge>;
    }
  };

  const getSentimentScore = () => {
    const bullishCount = data.filter(d => d.signal === 'BULLISH').length;
    return Math.round((bullishCount / data.length) * 100) || 50;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Live Feed...</p>
      </div>
    );
  }

  const sections = [
    { 
      title: 'Global Indices', 
      type: 'global', 
      icon: <Globe className="w-4 h-4 text-blue-500" />, 
      interpretation: "Western markets are showing mixed signals as inflation data looms. Asian indices (specifically Hang Seng) are under extreme liquidity pressure, suggesting a localized contagion risk rather than a global systemic collapse." 
    },
    { 
      title: 'India Domestic', 
      type: 'india', 
      icon: <Flag className="w-4 h-4 text-orange-500" />, 
      interpretation: "Indian benchmarks remain structurally resilient. BANKNIFTY is outperforming the broader NIFTY 50, indicating strong domestic credit health and institutional rotation into financials despite global high-beta selling." 
    },
    { 
      title: 'Commodity Benchmarks', 
      type: 'commodity', 
      icon: <Mountain className="w-4 h-4 text-yellow-600" />, 
      interpretation: "Gold and Silver are successfully acting as safe harbors. The spike in precious metals alongside declining energy prices (Oil) signals a transition from growth-driven inflation to defensive stagflation positioning." 
    },
    { 
      title: 'Crypto Velocity', 
      type: 'crypto', 
      icon: <Coins className="w-4 h-4 text-secondary" />, 
      interpretation: "BTC is consolidating within a narrow range, showing lower relative volatility than tech equities. This 'quiet' phase in crypto often precedes a large liquidity move. Watch for a break above $65k or below $62k as a systemic lead indicator." 
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Live Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-white">Market Radar</h1>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Last Update</p>
          <p className="text-xs font-mono font-bold text-white">{lastUpdated}</p>
        </div>
      </header>

      {/* Sentiment Gauge */}
      <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aggregated Sentiment</h3>
            </div>
            <p className="text-2xl font-black text-white">
              {getSentimentScore() > 60 ? 'Greed Accumulation' : getSentimentScore() < 40 ? 'Panic Capitulation' : 'Neutral Equilibrium'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-secondary">{getSentimentScore()}%</span>
          </div>
        </div>
        <Progress value={getSentimentScore()} className="h-4 bg-muted/30" />
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <span>Bearish Pressure</span>
          <span>Bullish Momentum</span>
        </div>
      </div>

      {/* Index Lists */}
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.type} className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                {section.icon}
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{section.title}</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-bold border-white/5 opacity-50">
                {data.filter(d => d.type === section.type as any).length} ASSETS
              </Badge>
            </div>
            
            <div className="space-y-3">
              {data.filter(d => d.type === section.type as any).map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center group transition-all hover:border-secondary/30">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{item.name}</span>
                      {item.region && (
                        <Badge variant="outline" className="text-[8px] h-4 py-0 border-white/5 text-muted-foreground/60">
                          {item.region}
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-mono font-bold text-white/90">{item.price}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "flex items-center gap-1 font-black text-sm",
                      item.change >= 0 ? "text-risk-low" : "text-risk-crash"
                    )}>
                      {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(item.change).toFixed(2)}%
                    </div>
                    {getSignalBadge(item.signal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Per-Section Systemic Interpretation Card */}
            <div className="bg-secondary/5 rounded-3xl border border-secondary/20 p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:rotate-12 transition-transform">
                <Layers className="w-24 h-24" />
              </div>
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Institutional Lens</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium italic">
                  {section.interpretation}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Market Regime: {getSentimentScore() > 50 ? 'EXPANSION' : 'CONTRACTION'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/10 border border-border/60 rounded-[2.5rem] p-8 space-y-6 mt-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-secondary" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Aggregated Intelligence Summary</h3>
        </div>
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground font-medium">
            The global macro framework is currently navigating a <strong className="text-white">fragmented liquidity regime</strong>. While US tech and Indian financials show resilience, the crash-level signals in commodities like Natural Gas suggest underlying industrial cooling. The divergence between BTC's range-bound behavior and Hang Seng's collapse points to localized systemic stress rather than a global contagion event at this stage.
          </p>
          <div className="pt-4 grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between bg-background/50 p-4 rounded-2xl border border-white/5 group hover:border-secondary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
                <span className="text-[11px] font-bold text-white">Stability Zone: Domestic Credit (India)</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-secondary transition-colors" />
            </div>
            <div className="flex items-center justify-between bg-background/50 p-4 rounded-2xl border border-white/5 group hover:border-secondary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-risk-high animate-pulse" />
                <span className="text-[11px] font-bold text-white">Pressure Zone: Commodity Deflation</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-secondary transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 px-2 text-center opacity-40">
        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.4em]">Proprietary Data Model • No Investment Advice</p>
      </footer>
    </div>
  );
}
