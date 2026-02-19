"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Loader2,
  Globe,
  Flag,
  Coins,
  Mountain,
  Info,
  Layers,
  ArrowRight,
  Gauge,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type MarketStat = {
  price: number;
  change1d: number;
  change5d: number;
  asOf: string;
};

type MarketPulse = {
  asOf: string;
  indices: {
    nifty: MarketStat;
    sensex: MarketStat;
    banknifty: MarketStat;
    spx: MarketStat;
    vix: MarketStat;
  };
  fx: {
    usdinr: MarketStat;
  };
  metals: {
    xauusd: MarketStat;
  };
  crypto: {
    btcusd: MarketStat;
    ethusd: MarketStat;
  };
  warnings?: string[];
};

interface IndexData {
  name: string;
  region?: string;
  price: string;
  change: number;
  type: "global" | "india" | "crypto" | "commodity";
  signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "CRASH";
}

function deriveSignal(change: number, type: IndexData["type"]): IndexData["signal"] {
  if (type === "crypto") {
    if (change >= 2) return "BULLISH";
    if (change <= -4) return "CRASH";
    if (change <= -1) return "BEARISH";
    return "NEUTRAL";
  }

  if (change >= 0.6) return "BULLISH";
  if (change <= -2.5) return "CRASH";
  if (change <= -0.8) return "BEARISH";
  return "NEUTRAL";
}

function formatPrice(value: number, digits = 2, currency = false) {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
  return currency ? `$${formatted}` : formatted;
}

function toLiveRows(pulse: MarketPulse): IndexData[] {
  const rows: Array<Omit<IndexData, "signal">> = [
    {
      name: "S&P 500",
      region: "US",
      price: formatPrice(pulse.indices.spx.price),
      change: pulse.indices.spx.change1d,
      type: "global",
    },
    {
      name: "VIX",
      region: "US",
      price: formatPrice(pulse.indices.vix.price),
      change: pulse.indices.vix.change1d,
      type: "global",
    },
    {
      name: "USD/INR",
      region: "FX",
      price: formatPrice(pulse.fx.usdinr.price, 4),
      change: pulse.fx.usdinr.change1d,
      type: "global",
    },
    {
      name: "NIFTY 50",
      region: "India",
      price: formatPrice(pulse.indices.nifty.price),
      change: pulse.indices.nifty.change1d,
      type: "india",
    },
    {
      name: "SENSEX",
      region: "India",
      price: formatPrice(pulse.indices.sensex.price),
      change: pulse.indices.sensex.change1d,
      type: "india",
    },
    {
      name: "BANKNIFTY",
      region: "India",
      price: formatPrice(pulse.indices.banknifty.price),
      change: pulse.indices.banknifty.change1d,
      type: "india",
    },
    {
      name: "Gold",
      region: "XAU/USD",
      price: formatPrice(pulse.metals.xauusd.price, 2, true),
      change: pulse.metals.xauusd.change1d,
      type: "commodity",
    },
    {
      name: "BTC",
      price: formatPrice(pulse.crypto.btcusd.price, 2, true),
      change: pulse.crypto.btcusd.change1d,
      type: "crypto",
    },
    {
      name: "ETH",
      price: formatPrice(pulse.crypto.ethusd.price, 2, true),
      change: pulse.crypto.ethusd.change1d,
      type: "crypto",
    },
  ];

  return rows
    .filter((item) => Number.isFinite(item.change) && Number.isFinite(Number(item.price.replace(/[$,]/g, ""))))
    .map((item) => ({
      ...item,
      signal: deriveSignal(item.change, item.type),
    }));
}

export default function LiveSignalsPage() {
  const [data, setData] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [asOf, setAsOf] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function fetchLiveIntelligence() {
      if (!mounted) return;
      const firstLoad = !hasLoadedRef.current;
      if (firstLoad) setLoading(true);
      else setRefreshing(true);

      try {
        const response = await fetch("/api/market-pulse", { cache: "no-store" });
        const json = (await response.json()) as MarketPulse & { error?: string };

        if (!response.ok) {
          throw new Error(json?.error || "Unable to fetch live market data.");
        }

        const rows = toLiveRows(json);
        if (!rows.length) {
          throw new Error("Live feed returned no rows.");
        }

        if (mounted) {
          setData(rows);
          setAsOf(json.asOf || "");
          setLastUpdated(new Date().toLocaleTimeString());
          setError(null);
          hasLoadedRef.current = true;
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Live feed unavailable.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    fetchLiveIntelligence();
    const interval = setInterval(fetchLiveIntelligence, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const sentimentScore = useMemo(() => {
    if (!data.length) return 50;
    const bullishCount = data.filter((d) => d.signal === "BULLISH").length;
    return Math.round((bullishCount / data.length) * 100);
  }, [data]);

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case "BULLISH":
        return <Badge className="bg-risk-low/20 text-risk-low border-risk-low/30 hover:bg-risk-low/20">BULLISH</Badge>;
      case "BEARISH":
        return <Badge className="bg-risk-crash/10 text-risk-crash border-risk-crash/30 hover:bg-risk-crash/10">BEARISH</Badge>;
      case "CRASH":
        return <Badge className="bg-risk-crash text-white border-transparent animate-pulse">CRASH</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground border-white/10">
            NEUTRAL
          </Badge>
        );
    }
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
      title: "Global Indices",
      type: "global",
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      interpretation:
        "Macro assets are being updated from the same live pulse endpoint. Track divergence between S&P, VIX, and USD/INR for cross-market stress.",
    },
    {
      title: "India Domestic",
      type: "india",
      icon: <Flag className="w-4 h-4 text-orange-500" />,
      interpretation:
        "NIFTY captures local risk appetite. Relative strength versus US benchmarks can indicate whether domestic flows are decoupling.",
    },
    {
      title: "Commodity Benchmarks",
      type: "commodity",
      icon: <Mountain className="w-4 h-4 text-yellow-600" />,
      interpretation:
        "Gold is treated as a defensive barometer. Sustained positive moves during equity weakness usually indicate risk-off rotation.",
    },
    {
      title: "Crypto Velocity",
      type: "crypto",
      icon: <Coins className="w-4 h-4 text-secondary" />,
      interpretation:
        "BTC and ETH are fetched in near-real-time. Sharp downside momentum often precedes broader risk-asset deleveraging.",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn("w-2 h-2 rounded-full", refreshing ? "bg-secondary animate-pulse" : "bg-secondary/60")} />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="text-[11px] leading-tight">
                    <strong>Realtime Indicator</strong>
                    <div className="mt-1">- Polls /api/market-pulse every 15 seconds using no-store cache.</div>
                    <div>- Sentiment = bullish assets / total monitored assets.</div>
                    <div className="mt-1">- Signals are derived from per-asset daily change thresholds.</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Live Intelligence</span>
            {error && (
              <Badge variant="outline" className="text-[8px] border-risk-crash/40 text-risk-crash">
                Feed Degraded
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black text-white">Market Radar</h1>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Last Update</p>
          <p className="text-xs font-mono font-bold text-white">{lastUpdated || "-"}</p>
          {asOf && <p className="text-[9px] text-muted-foreground">As of {asOf}</p>}
        </div>
      </header>

      <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aggregated Sentiment</h3>
            </div>
            <p className="text-2xl font-black text-white">
              {sentimentScore > 60 ? "Greed Accumulation" : sentimentScore < 40 ? "Panic Capitulation" : "Neutral Equilibrium"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-secondary">{sentimentScore}%</span>
          </div>
        </div>
        <Progress value={sentimentScore} className="h-4 bg-muted/30" />
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <span>Bearish Pressure</span>
          <span>Bullish Momentum</span>
        </div>
      </div>

      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.type} className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                {section.icon}
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{section.title}</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-bold border-white/5 opacity-50">
                {data.filter((d) => d.type === section.type).length} ASSETS
              </Badge>
            </div>

            <div className="space-y-3">
              {data
                .filter((d) => d.type === section.type)
                .map((item) => (
                  <div
                    key={`${section.type}-${item.name}`}
                    className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center group transition-all hover:border-secondary/30"
                  >
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
                      <div
                        className={cn(
                          "flex items-center gap-1 font-black text-sm",
                          item.change >= 0 ? "text-risk-low" : "text-risk-crash"
                        )}
                      >
                        {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(item.change).toFixed(2)}%
                      </div>
                      {getSignalBadge(item.signal)}
                    </div>
                  </div>
                ))}
            </div>

            <div className="bg-secondary/5 rounded-3xl border border-secondary/20 p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:rotate-12 transition-transform">
                <Layers className="w-24 h-24" />
              </div>
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Institutional Lens</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium italic">{section.interpretation}</p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    Market Regime: {sentimentScore > 50 ? "EXPANSION" : "CONTRACTION"}
                  </span>
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
            Live rows are now mapped directly from the backend pulse feed instead of static client mocks, so every displayed section reflects the latest available API snapshot.
          </p>
          <div className="pt-4 grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between bg-background/50 p-4 rounded-2xl border border-white/5 group hover:border-secondary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-risk-low animate-pulse" />
                <span className="text-[11px] font-bold text-white">Stability Zone: Domestic Trend Strength</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-secondary transition-colors" />
            </div>
            <div className="flex items-center justify-between bg-background/50 p-4 rounded-2xl border border-white/5 group hover:border-secondary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-risk-high animate-pulse" />
                <span className="text-[11px] font-bold text-white">Pressure Zone: Volatility and FX Stress</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-secondary transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 px-2 text-center opacity-40">
        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.4em]">Proprietary Data Model - No Investment Advice</p>
      </footer>
    </div>
  );
}
