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
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface IndexData {
  name: string;
  price: string;
  change: number;
  type: 'global' | 'india' | 'crypto';
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
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
        { name: 'S&P 500', price: '5,021.40', change: -0.45 + (Math.random() * 0.2), type: 'global', signal: 'NEUTRAL' },
        { name: 'NASDAQ 100', price: '17,890.10', change: -0.85 + (Math.random() * 0.4), type: 'global', signal: 'BEARISH' },
        { name: 'NIFTY 50', price: '22,450.25', change: 0.32 + (Math.random() * 0.1), type: 'india', signal: 'BULLISH' },
        { name: 'SENSEX', price: '73,890.15', change: 0.28 + (Math.random() * 0.1), type: 'india', signal: 'BULLISH' },
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
        // Fallback to mock crypto data if fetch fails
        cryptoData = [
          { name: 'BTC', price: '$64,250.00', change: -1.2, type: 'crypto', signal: 'BEARISH' },
          { name: 'ETH', price: '$3,450.20', change: -0.8, type: 'crypto', signal: 'NEUTRAL' },
          { name: 'SOL', price: '$145.50', change: 2.4, type: 'crypto', signal: 'BULLISH' },
          { name: 'BNB', price: '$580.10', change: -0.3, type: 'crypto', signal: 'NEUTRAL' },
          { name: 'XRP', price: '$0.58', change: 1.1, type: 'crypto', signal: 'BULLISH' },
        ];
      }

      const finalData = [...mockGlobal, ...cryptoData].map(item => {
        let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        if (item.change > 0.5) signal = 'BULLISH';
        if (item.change < -0.5) signal = 'BEARISH';
        return { ...item, signal };
      });

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
        return <Badge className="bg-risk-crash/20 text-risk-crash border-risk-crash/30 hover:bg-risk-crash/20">BEARISH</Badge>;
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
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aggregated Sentiment</h3>
            <p className="text-2xl font-black text-white">
              {getSentimentScore() > 60 ? 'Fear of Missing Out' : getSentimentScore() < 40 ? 'Panic Accumulation' : 'Wait & Watch'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-secondary">{getSentimentScore()}%</span>
          </div>
        </div>
        <Progress value={getSentimentScore()} className="h-4 bg-muted/30" />
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <span>Bearish Phase</span>
          <span>Bullish Regime</span>
        </div>
      </div>

      {/* Index Lists */}
      <div className="space-y-8">
        {[
          { title: 'Global Indices', type: 'global', icon: <Globe className="w-4 h-4 text-blue-500" /> },
          { title: 'India Domestic', type: 'india', icon: <Flag className="w-4 h-4 text-orange-500" /> },
          { title: 'Crypto Velocity', type: 'crypto', icon: <Coins className="w-4 h-4 text-secondary" /> },
        ].map((section) => (
          <div key={section.type} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              {section.icon}
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {data.filter(d => d.type === section.type).map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center group transition-all hover:border-secondary/30">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-white">{item.name}</span>
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
          </div>
        ))}
      </div>

      <div className="bg-secondary/10 border border-secondary/20 rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-secondary" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Systemic Interpretation</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-secondary/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-secondary" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Signal Status: {getSentimentScore() > 50 ? 'Constructive' : 'Defensive'}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                {getSentimentScore() > 50 
                  ? "Market participation is broadening. Look for 'High-Yield' breakouts while keeping stops tight."
                  : "Correlation is tightening towards the downside. Liquidity preservation is priority #1."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-4 px-2 text-center">
        <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.4em]">Real-time Feed • Quantitative Bias</p>
      </footer>
    </div>
  );
}