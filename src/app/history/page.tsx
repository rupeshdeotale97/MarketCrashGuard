"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  History, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  TrendingDown,
  Target,
  Zap,
  LineChart,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Info,
  Waves,
  BrainCircuit,
  Binary,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp as TrendUpIcon,
  Skull,
  Thermometer,
  Banknote,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tooltip as UiTooltip, TooltipTrigger as UiTooltipTrigger, TooltipContent as UiTooltipContent, TooltipProvider as UiTooltipProvider } from '@/components/ui/tooltip';

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

const bennerCycleData = [
  { year: 1999, level: 100, type: 'Panic', event: 'Dot-com Peak' },
  { year: 2003, level: 20, type: 'Hard Times', event: 'Post-Bubble Bottom' },
  { year: 2007, level: 80, type: 'High Prices', event: 'GFC Peak' },
  { year: 2011, level: 50, type: 'Stable', event: 'Eurozone Crisis' },
  { year: 2016, level: 100, type: 'Panic', event: 'China Growth Slowdown' },
  { year: 2021, level: 20, type: 'Hard Times', event: 'Post-COVID Stimulus' },
  { year: 2024, level: 60, type: 'Recovery', event: 'Current Regime' },
  { year: 2026, level: 80, type: 'High Prices', event: 'Projected Cycle High' },
  { year: 2035, level: 100, type: 'Panic', event: 'Estimated Next Panic' },
];

export default function HistoryPage() {
  const [view, setView] = useState<'replay' | 'benner'>('replay');
  const [activeYear, setActiveYear] = useState<'2008' | '2020' | '2022'>('2008');
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const history = historicalIntelligence[activeYear];

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await fetch('/api/market-sentiments');
        const data = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (view === 'benner') {
      fetchMarketData();
    }
  }, [view]);

  const chartConfig = {
    level: {
      label: "Cycle Intensity",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">
            Premium Intelligence
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Intelligence Replay</h1>
        <p className="text-sm text-muted-foreground font-medium">Study past systemic collapses and cyclical disorder.</p>
      </header>

      <div className="flex bg-muted/20 p-1 rounded-2xl border border-border">
        <button 
          onClick={() => setView('replay')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
            view === 'replay' ? "bg-secondary text-white shadow-lg" : "text-muted-foreground hover:text-white"
          )}
        >
          Event Replay
        </button>
        <button 
          onClick={() => setView('benner')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
            view === 'benner' ? "bg-secondary text-white shadow-lg" : "text-muted-foreground hover:text-white"
          )}
        >
          Benner Cycle
        </button>
      </div>

      {view === 'replay' ? (
        <div className="space-y-6">
          <Tabs defaultValue="2008" className="w-full" onValueChange={(v) => setActiveYear(v as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-muted/20 p-1 h-12 rounded-2xl">
              <TabsTrigger value="2008" className="rounded-xl font-bold text-xs">2008 GFC</TabsTrigger>
              <TabsTrigger value="2020" className="rounded-xl font-bold text-xs">2020 COVID</TabsTrigger>
              <TabsTrigger value="2022" className="rounded-xl font-bold text-xs">2022 CRYPTO</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
            </div>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-2xl relative">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Est. 1875 Analysis</span>
                <h2 className="text-2xl font-black text-white">Samuel Benner Cycle</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                  "Mapping the rhythmic waves of pig iron prices and market panic."
                </p>
              </div>

              <div className="h-64 w-full mt-4">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart data={bennerCycleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} 
                    />
                    <YAxis hide />
                    <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                    <Area 
                      type="monotone" 
                      dataKey="level" 
                      stroke="hsl(var(--secondary))" 
                      fillOpacity={1} 
                      fill="url(#colorLevel)" 
                    />
                    <ReferenceLine y={80} stroke="hsl(var(--risk-high))" strokeDasharray="3 3" />
                    <ReferenceLine y={100} stroke="hsl(var(--risk-crash))" strokeDasharray="3 3" />
                  </AreaChart>
                </ChartContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-3 bg-muted/10 rounded-2xl border border-border/40">
                  <Skull className="w-4 h-4 mx-auto mb-1 text-risk-crash" />
                  <p className="text-[8px] font-black uppercase text-muted-foreground">Series A</p>
                  <p className="text-[10px] font-bold text-white">Panics</p>
                </div>
                <div className="text-center p-3 bg-muted/10 rounded-2xl border border-border/40">
                  <TrendUpIcon className="w-4 h-4 mx-auto mb-1 text-secondary" />
                  <p className="text-[8px] font-black uppercase text-muted-foreground">Series B</p>
                  <p className="text-[10px] font-bold text-white">Good Times</p>
                </div>
                <div className="text-center p-3 bg-muted/10 rounded-2xl border border-border/40">
                  <TrendingDown className="w-4 h-4 mx-auto mb-1 text-risk-low" />
                  <p className="text-[8px] font-black uppercase text-muted-foreground">Series C</p>
                  <p className="text-[10px] font-bold text-white">Hard Times</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-[2rem] p-7 space-y-6">
             <div className="flex items-center gap-3">
              <UiTooltipProvider>
                <UiTooltip>
                  <UiTooltipTrigger asChild>
                    <Zap className="w-5 h-5 text-secondary" />
                  </UiTooltipTrigger>
                  <UiTooltipContent className="max-w-xs">
                    <div className="text-[11px] leading-tight">
                      <strong>Real-time Indicators</strong>
                      <div className="mt-1">• Inflation and Credit Spreads are direct sourced metrics displayed above.</div>
                      <div className="mt-1">• Sentiment is computed as: (number of assets marked BULLISH ÷ total monitored assets) × 100.</div>
                      <div className="mt-1">• Sentiment labels are derived from thresholds applied to the sentiment score (e.g., &gt;60 = Greed, &lt;40 = Panic).</div>
                      <div className="mt-1">• Data fetched from <code>/api/market-sentiments</code> when the Benner view is active.</div>
                    </div>
                  </UiTooltipContent>
                </UiTooltip>
              </UiTooltipProvider>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Real-time Indicators</h3>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : marketData ? (
              <UiTooltipProvider>
                <div className="grid grid-cols-3 gap-4">
                  <UiTooltip>
                    <UiTooltipTrigger asChild>
                      <div className="text-center cursor-help">
                        <Thermometer className="w-5 h-5 mx-auto text-risk-high" />
                        <p className="text-sm font-bold mt-1">{marketData.inflation}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Inflation</p>
                      </div>
                    </UiTooltipTrigger>
                    <UiTooltipContent className="max-w-xs">
                      <div className="text-[11px] leading-tight">
                        <strong>Inflation</strong>
                        <div className="mt-1">Reported CPI/PCE or regional equivalent. Shown value is the most recent published rate from the data source.</div>
                      </div>
                    </UiTooltipContent>
                  </UiTooltip>

                  <UiTooltip>
                    <UiTooltipTrigger asChild>
                      <div className="text-center cursor-help">
                        <Banknote className="w-5 h-5 mx-auto text-risk-low" />
                        <p className="text-sm font-bold mt-1">{marketData.creditSpreads}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Credit Spreads</p>
                      </div>
                    </UiTooltipTrigger>
                    <UiTooltipContent className="max-w-xs">
                      <div className="text-[11px] leading-tight">
                        <strong>Credit Spreads</strong>
                        <div className="mt-1">Difference between corporate bond yields and risk-free Treasuries. Wider spreads indicate higher credit stress/liquidity risk.</div>
                      </div>
                    </UiTooltipContent>
                  </UiTooltip>

                  <UiTooltip>
                    <UiTooltipTrigger asChild>
                      <div className="text-center cursor-help">
                        <Gauge className="w-5 h-5 mx-auto text-risk-elevated" />
                        <p className="text-sm font-bold mt-1">{marketData.sentiment}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{marketData.sentimentLabel}</p>
                      </div>
                    </UiTooltipTrigger>
                    <UiTooltipContent className="max-w-xs">
                      <div className="text-[11px] leading-tight">
                        <strong>Aggregated Sentiment</strong>
                        <div className="mt-1">Calculated as (number of assets marked BULLISH ÷ total monitored assets) × 100. Labels map to thresholds (e.g., &gt;60 = Greed, &lt;40 = Panic).</div>
                        <div className="mt-1">Data originates from <code>/api/market-sentiments</code>.</div>
                      </div>
                    </UiTooltipContent>
                  </UiTooltip>
                </div>
              </UiTooltipProvider>
            ) : (
              <div className="flex justify-center items-center h-24">
                <p className="text-sm text-muted-foreground">Failed to load data.</p>
              </div>
            )}
          </div>

          <div className="bg-secondary/10 border border-secondary/20 rounded-[2rem] p-7 space-y-6">
             <div className="flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-secondary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Predictive Intelligence Terminal</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Phase: Current Transition</span>
                  <Badge className="bg-secondary text-[8px]">RECOVERY (B-C)</Badge>
                </div>
                <p className="text-xs font-bold text-white leading-tight">2024 - 2026 Prediction: The High Price Run</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  We are currently in a <strong className="text-white">recovery phase</strong>, transitioning from the "Hard Times" of 2022-23. Benner's cycle suggests a period of industrial re-expansion, leading to a <strong className="text-white">major "Series B" high in late 2026.</strong> This aligns with modern liquidity cycles following interest rate pivots, but is currently battling persistent inflation.
                </p>
              </div>

              <div className="h-px w-full bg-secondary/20" />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-risk-crash uppercase tracking-widest">Phase: Long-Term Horizon</span>
                  <Badge variant="outline" className="border-risk-crash/40 text-risk-crash text-[8px]">PANIC WARNING</Badge>
                </div>
                <p className="text-xs font-bold text-white leading-tight">2035 Projection: Systemic Panic Phase</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Benner's 16-18-20 year sequence identifies <strong className="text-white">2035</strong> as the next major "Series A" Panic year. This correlates with aging debt cycles and projected fiscal stressors. Risk management protocols should prepare for increasing volatility as we approach the 2030s.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/10 rounded-3xl p-6 border border-border space-y-4">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Cycle Anatomy (1875)</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-risk-crash/20 flex items-center justify-center shrink-0 font-black text-xs text-risk-crash">A</div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">The Panic Cycle</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Occurs in a 16-18-20 year sequence. These are periods of extreme speculative excess followed by sudden systemic collapse.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 font-black text-xs text-secondary">B</div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">The High Price Cycle</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Repeats every 8-9-10 years. This marks the peak of commercial activity where assets should be sold for cash.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-risk-low/20 flex items-center justify-center shrink-0 font-black text-xs text-risk-low">C</div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">The Hard Times Cycle</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">The bottom of the 16-18-20 year trend. This is the optimal accumulation zone for generational wealth building.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="p-3 bg-background rounded-xl border border-border">
              <Binary className="w-5 h-5 text-secondary" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Historical Basis</p>
              <p className="text-xs font-bold text-white">The Pig Iron Correlation</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Benner discovered that the price of pig iron—a fundamental industrial input—behaved in rhythmic 11-year cycles, which accurately predicted the stock market panics of 1819, 1837, 1857, and 1873.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <BarChart3 className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cycle Correlations</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { year: "2024-2026", cycle: "Accumulation to Peak", result: "Current Transition: Moving toward Series B High Prices.", color: "text-risk-low", icon: <ArrowUpRight className="w-4 h-4" /> },
                { year: "2022-2023", cycle: "Hard Times", result: "Series C (Low) accumulation phase matched reality.", color: "text-risk-high", icon: <ShieldCheck className="w-4 h-4" /> },
                { year: "2020-2021", cycle: "Panic Phase", result: "COVID shock perfectly timed with Panic sequence.", color: "text-risk-elevated", icon: <AlertCircle className="w-4 h-4" /> },
                { year: "2007-2008", cycle: "High to Panic", result: "Series B (High) led to Series A (Panic) crash.", color: "text-risk-crash", icon: <TrendingDown className="w-4 h-4" /> }
              ].map((cor, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center group hover:border-secondary/30 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-secondary uppercase">{cor.year}</span>
                    <span className="text-sm font-bold text-white">{cor.cycle}</span>
                    <p className="text-[10px] text-muted-foreground font-medium">{cor.result}</p>
                  </div>
                  <div className={cn("shrink-0", cor.color)}>
                    {cor.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/10 border-2 border-secondary/20 rounded-[2rem] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Axiom of Time</span>
            </div>
            <p className="text-xs leading-relaxed text-white/80 font-semibold italic">
              "Financial disorder follows math. By mapping 1875 logic to modern liquidity, we find that panics are not random—they are rhythmic washes of the systemic tide."
            </p>
          </div>
        </div>
      )}

      <footer className="mt-auto px-4 text-center">
        <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.3em]">Institutional Grade Data • Educational Archive</p>
      </footer>
    </div>
  );
}
