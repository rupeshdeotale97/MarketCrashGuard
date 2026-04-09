"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Zap,
  Globe,
  Flag,
  Coins,
  Mountain,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

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
};

type CryptoBar = {
  name: string;
  change: number;
  fill: string;
};

function toCryptoBar(name: string, change: number): CryptoBar {
  return {
    name,
    change,
    fill: change < 0 ? "hsl(var(--risk-crash))" : "hsl(var(--risk-low))",
  };
}

function buildPulseCryptoBars(pulse: MarketPulse | null): CryptoBar[] {
  if (!pulse) return [];

  return [
    toCryptoBar("BTC", pulse.crypto?.btcusd?.change1d || 0),
    toCryptoBar("ETH", pulse.crypto?.ethusd?.change1d || 0),
  ];
}

export default function ChecklistPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [pulse, setPulse] = useState<MarketPulse | null>(null);
  const [pulseError, setPulseError] = useState<string | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoBar[]>([]);

  useEffect(() => {
    setIsMounted(true);
    let mounted = true;

    async function fetchMarketData() {
      if (!mounted) return;
      setFetching(true);
      try {
        const pulseResponse = await fetch("/api/market-pulse", { cache: "no-store" });

        if (!pulseResponse.ok) {
          const pulseJson = await pulseResponse.json().catch(() => ({}));
          throw new Error(pulseJson?.error || "Unable to load realtime pulse.");
        }

        const pulseJson = (await pulseResponse.json()) as MarketPulse;
        if (mounted) {
          setPulse(pulseJson);
          setCryptoData(buildPulseCryptoBars(pulseJson));
          setPulseError(null);
        }

        try {
          const cryptoResponse = await fetch("https://api.coincap.io/v2/assets?limit=8", {
            signal: AbortSignal.timeout(5000),
          });

          if (cryptoResponse.ok) {
            const cryptoJson = await cryptoResponse.json();
            if (mounted && Array.isArray(cryptoJson?.data)) {
              const bars: CryptoBar[] = cryptoJson.data.map((item: any) => {
                const change = Number.parseFloat(item?.changePercent24Hr || "0");
                return toCryptoBar(item?.symbol || "-", change);
              });
              setCryptoData(bars);
            }
          }
        } catch {
          if (mounted) {
            setCryptoData(buildPulseCryptoBars(pulseJson));
          }
        }
      } catch (error: any) {
        if (mounted) {
          setPulseError(error?.message || "Unable to load realtime data.");
          setCryptoData([]);
        }
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

  const derived = useMemo(() => {
    if (!pulse) {
      return {
        crashConfirmed: false,
        volatilitySpike: false,
        liquidityShock: false,
        creditStress: false,
        externalShock: false,
        niftyChange: 0,
        spxChange: 0,
        sensexChange: 0,
        bankniftyChange: 0,
        usdinrPrice: 0,
        usdinrChange: 0,
        goldPrice: 0,
        goldChange: 0,
        btcChange: 0,
        ethChange: 0,
        actions: ["Waiting for realtime market feed..."],
      };
    }

    const niftyChange = pulse.indices.nifty.change1d || 0;
    const spxChange = pulse.indices.spx.change1d || 0;
    const sensexChange = pulse.indices.sensex.change1d || 0;
    const bankniftyChange = pulse.indices.banknifty.change1d || 0;
    const usdinrPrice = pulse.fx.usdinr.price || 0;
    const usdinrChange = pulse.fx.usdinr.change1d || 0;
    const goldPrice = pulse.metals.xauusd.price || 0;
    const goldChange = pulse.metals.xauusd.change1d || 0;
    const btcChange = pulse.crypto.btcusd.change1d || 0;
    const ethChange = pulse.crypto.ethusd.change1d || 0;
    const vixLevel = pulse.indices.vix.price || 0;

    const volatilitySpike = Math.abs(btcChange) > 4 || Math.abs(ethChange) > 4 || Math.abs(spxChange) > 1.8;
    const liquidityShock = pulse.indices.spx.change5d < -3 || pulse.indices.nifty.change5d < -3 || btcChange < -5;
    const creditStress = vixLevel > 24 || spxChange < -1.5;
    const externalShock = usdinrChange > 0.8 || goldChange > 1.5;

    const crashConfirmed = [volatilitySpike, liquidityShock, creditStress, externalShock].filter(Boolean).length >= 2;

    const actions: string[] = [];
    if (crashConfirmed) {
      actions.push("Reduce high-beta exposure and preserve liquidity.");
      actions.push("Hedge downside with staged defensive allocations.");
      actions.push("Avoid leveraged entries until volatility cools.");
    } else {
      actions.push("Keep position sizing disciplined and monitor risk factors.");
      actions.push("Rebalance gradually instead of reacting to single candles.");
      actions.push("Track VIX, USD/INR, and crypto momentum for early warnings.");
    }

    return {
      crashConfirmed,
      volatilitySpike,
      liquidityShock,
      creditStress,
      externalShock,
      niftyChange,
      spxChange,
      sensexChange,
      bankniftyChange,
      usdinrPrice,
      usdinrChange,
      goldPrice,
      goldChange,
      btcChange,
      ethChange,
      actions,
    };
  }, [pulse]);

  const groupedChecklist = [
    {
      title: "Global Systemic",
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      items: [
        { label: "Systemic Credit Stress", value: derived.creditStress, desc: "Derived from VIX and US equity shock behavior.", trigger: "VIX > 24" },
        { label: "S&P Stress Session", value: derived.spxChange < -1.5, desc: "US benchmark showing outsized downside momentum.", trigger: "S&P 1D < -1.5%" },
        { label: "External Macro Shock", value: derived.externalShock, desc: "Currency/gold regime shift suggests stress transmission.", trigger: "USDINR/GOLD spike" },
        { label: "Volatility Cluster", value: derived.volatilitySpike, desc: "Multi-asset volatility expansion across risk assets.", trigger: "Cross-asset spike" },
      ],
    },
    {
      title: "Indian Market",
      icon: <Flag className="w-4 h-4 text-orange-500" />,
      items: [
        { label: "NIFTY Volatility Spike", value: derived.niftyChange < -2, desc: "Extreme daily drawdown in NIFTY.", trigger: "NIFTY < -2%" },
        { label: "SENSEX Breakdown", value: derived.sensexChange < -2, desc: "Broad market risk-off expansion in large caps.", trigger: "SENSEX < -2%" },
        { label: "BANKNIFTY Weakness", value: derived.bankniftyChange < -2, desc: "Credit-sensitive index under stress.", trigger: "BANKNIFTY < -2%" },
        { label: "FX Pressure", value: derived.usdinrChange > 0.5, desc: "INR weakness implies imported risk and tighter liquidity.", trigger: "USD/INR +0.5%" },
      ],
    },
    {
      title: "Commodities",
      icon: <Mountain className="w-4 h-4 text-yellow-600" />,
      items: [
        { label: "Gold Safe Haven Pivot", value: derived.goldChange > 1, desc: "Defensive rotation into precious metals.", trigger: "XAU 1D > +1%" },
        { label: "Risk-Off Gold Burst", value: derived.goldPrice > 0 && derived.goldChange > 1.5, desc: "Fear-driven acceleration in safe-haven demand.", trigger: "XAU 1D > +1.5%" },
      ],
    },
    {
      title: "Currencies",
      icon: <Banknote className="w-4 h-4 text-emerald-500" />,
      items: [
        { label: "INR Devaluation", value: derived.usdinrPrice > 84.5, desc: "Rupee weakness versus USD signals EM pressure.", trigger: "USD/INR > 84.50" },
        { label: "USD Momentum Shock", value: derived.usdinrChange > 0.8, desc: "Fast FX move often accompanies deleveraging windows.", trigger: "USD/INR 1D > +0.8%" },
      ],
    },
    {
      title: "Crypto Index",
      icon: <Coins className="w-4 h-4 text-secondary" />,
      items: [
        { label: "Volatility Implosion", value: derived.volatilitySpike, desc: "Extreme BTC/ETH move flags unstable liquidity.", trigger: "|BTC/ETH| > 4%" },
        { label: "Liquidity Evaporation", value: derived.liquidityShock, desc: "Sustained downside trend with weak participation.", trigger: "5D risk shock" },
        { label: "BTC Stress", value: derived.btcChange < -5, desc: "Large daily BTC drawdown signals broad risk contraction.", trigger: "BTC 1D < -5%" },
      ],
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
          <p className="text-sm text-muted-foreground mt-1">Realtime rule-based confirmation.</p>
          {pulseError && <p className="text-[10px] text-risk-crash font-bold uppercase mt-1">{pulseError}</p>}
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

      <div
        className={cn(
          "rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-center border transition-all duration-700",
          derived.crashConfirmed
            ? "bg-risk-crash/10 border-risk-crash/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
            : "bg-risk-low/5 border-risk-low/20"
        )}
      >
        <div
          className={cn(
            "p-5 rounded-full shadow-inner transition-transform duration-500",
            derived.crashConfirmed ? "bg-risk-crash/20 text-risk-crash scale-110" : "bg-risk-low/20 text-risk-low"
          )}
        >
          {derived.crashConfirmed ? <AlertTriangle className="w-14 h-14 animate-pulse" /> : <ShieldCheck className="w-14 h-14" />}
        </div>
        <div className="space-y-1">
          <h2
            className={cn(
              "text-3xl font-black uppercase tracking-tighter",
              derived.crashConfirmed ? "text-risk-crash" : "text-risk-low"
            )}
          >
            {derived.crashConfirmed ? "CRASH CONFIRMED" : "SYSTEM STABLE"}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-[0.2em]">
            Safety Protocol Status: {derived.crashConfirmed ? "DEFENSIVE" : "OPTIMAL"}
          </p>
        </div>
      </div>

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
            cryptoData.length ? (
              <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                <BarChart data={cryptoData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "hsl(var(--muted)/0.3)" }} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                  <Bar dataKey="change" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[11px] text-muted-foreground">No realtime crypto bars available.</div>
            )
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {groupedChecklist.map((group, groupIdx) => (
          <div key={groupIdx} className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-muted/20 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                {group.icon}
                <span className="text-xs font-black uppercase tracking-widest text-white">{group.title}</span>
              </div>
              <Badge variant="outline" className="text-[8px] border-white/5 text-muted-foreground/50">
                {group.items.length} FACTORS
              </Badge>
            </div>
            <div className="divide-y divide-border">
              {group.items.map((item, i) => (
                <div key={i} className="px-6 py-5 flex items-center justify-between group transition-all hover:bg-muted/10">
                  <div className="flex flex-col gap-0.5 max-w-[75%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[14px] leading-tight text-white">{item.label}</span>
                      <Badge variant="outline" className="text-[8px] font-black h-4 py-0 border-white/10 text-muted-foreground/60 uppercase tracking-tighter shrink-0">
                        {item.trigger}
                      </Badge>
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
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Suggested Guidance</h3>
        <div className="space-y-2">
          {derived.actions.map((action, i) => (
            <div key={`${action}-${i}`} className="flex items-center gap-4 px-5 py-4 bg-muted/20 rounded-[1.25rem] border border-border/60 group">
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-transform",
                  derived.crashConfirmed ? "bg-risk-crash animate-pulse" : "bg-secondary"
                )}
              />
              <span className="font-semibold text-sm">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
