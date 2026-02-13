"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BadgeCheck,
  Compass,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
} from "lucide-react";

const baseAllocations = {
  GROWTH: {
    equity: 55,
    debt: 20,
    gold: 8,
    realEstate: 7,
    crypto: 5,
    cash: 5,
  },
  BALANCED: {
    equity: 45,
    debt: 25,
    gold: 12,
    realEstate: 6,
    crypto: 4,
    cash: 8,
  },
  DEFENSIVE: {
    equity: 30,
    debt: 30,
    gold: 15,
    realEstate: 5,
    crypto: 2,
    cash: 18,
  },
} as const;

type Allocation = {
  equity: number;
  debt: number;
  gold: number;
  realEstate: number;
  crypto: number;
  cash: number;
};

type MarketPulse = {
  asOf: string;
  indices: {
    nifty: MarketStat;
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
  outlook: {
    mode: "GROWTH" | "BALANCED" | "DEFENSIVE";
    prediction: string;
    riskScore: number;
  };
  symbols: Record<string, string>;
  warnings?: string[];
};

type MarketStat = {
  price: number;
  change1d: number;
  change5d: number;
  asOf: string;
};

type CasSummary = {
  allocation: Allocation;
  totalValue: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

const emptyAllocation: Allocation = {
  equity: 0,
  debt: 0,
  gold: 0,
  realEstate: 0,
  crypto: 0,
  cash: 0,
};

export default function ScannerPage() {
  const [marketPulse, setMarketPulse] = useState<MarketPulse | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);

  const [equity, setEquity] = useState(48);
  const [debt, setDebt] = useState(22);
  const [gold, setGold] = useState(10);
  const [realEstate, setRealEstate] = useState(6);
  const [crypto, setCrypto] = useState(4);
  const [cash, setCash] = useState(10);
  const [indiaEquityShare, setIndiaEquityShare] = useState(55);
  const [stressLevel, setStressLevel] = useState(35);
  const [showAutoRebalance, setShowAutoRebalance] = useState(true);
  const [riskAppetite, setRiskAppetite] = useState(55);

  const [casFile, setCasFile] = useState<File | null>(null);
  const [casPassword, setCasPassword] = useState("");
  const [casLoading, setCasLoading] = useState(false);
  const [casError, setCasError] = useState<string | null>(null);
  const [casSummary, setCasSummary] = useState<CasSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchMarketPulse() {
      try {
        setMarketLoading(true);
        const response = await fetch("/api/market-pulse", { cache: "no-store" });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || "Unable to load market data.");
        }
        if (mounted) {
          setMarketPulse(json);
          setMarketError(null);
        }
      } catch (error: any) {
        if (mounted) {
          setMarketError(error?.message || "Unable to load market data.");
        }
      } finally {
        if (mounted) setMarketLoading(false);
      }
    }

    fetchMarketPulse();
    const interval = setInterval(fetchMarketPulse, 120000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const total = equity + debt + gold + realEstate + crypto + cash;

  const marketMode = marketPulse?.outlook.mode ?? "BALANCED";

  const stressMode =
    stressLevel >= 70 ? "DEFENSIVE" : stressLevel >= 40 ? "BALANCED" : "GROWTH";

  const appetiteMode =
    riskAppetite >= 70 ? "GROWTH" : riskAppetite >= 40 ? "BALANCED" : "DEFENSIVE";

  const finalMode =
    marketMode === "DEFENSIVE" || stressMode === "DEFENSIVE"
      ? "DEFENSIVE"
      : marketMode === "BALANCED" || stressMode === "BALANCED"
        ? "BALANCED"
        : "GROWTH";
  const recommended = useMemo(() => {
    const base = baseAllocations[finalMode];
    const indiaBias = marketPulse?.indices?.nifty?.change5d ?? 0;
    const globalBias = marketPulse?.indices?.spx?.change5d ?? 0;
    const indiaShare =
      indiaBias > globalBias + 1
        ? 65
        : indiaBias < globalBias - 1
          ? 40
          : 52;
    return { ...base, indiaShare };
  }, [finalMode, marketPulse]);

  const diversifiedScore = useMemo(() => {
    const weights = [equity, debt, gold, realEstate, crypto, cash];
    const sum = weights.reduce((acc, value) => acc + value, 0) || 1;
    const hhi = weights.reduce((acc, value) => {
      const w = value / sum;
      return acc + w * w;
    }, 0);
    return Math.max(0, Math.min(100, Math.round((1 - hhi) * 120)));
  }, [equity, debt, gold, realEstate, crypto, cash]);

  const suggestions = useMemo(() => {
    const tips: string[] = [];
    const risky = equity + crypto;
    const defensive = debt + gold + cash;
    const targetRisky = recommended.equity + recommended.crypto;
    const targetDefensive = recommended.debt + recommended.gold + recommended.cash;

    if (total !== 100) {
      tips.push("Bring total allocation back to 100% for a clean diversification signal.");
    }
    if (risky > targetRisky + 5) {
      tips.push("Reduce high-risk exposure to align with current market regime.");
    }
    if (defensive < targetDefensive - 5) {
      tips.push("Add defensive ballast using debt, gold, or cash.");
    }
    if (crypto > 10 || (marketPulse && marketPulse.crypto.btcusd.change1d < -4)) {
      tips.push("Trim crypto weight while volatility remains elevated.");
    }
    if (gold < 6 && marketPulse && marketPulse.indices.vix.price > 20) {
      tips.push("Consider a modest gold allocation for drawdown control.");
    }
    if (realEstate < 5 && equity > 50) {
      tips.push("Add REIT/InvIT exposure to diversify equity concentration.");
    }
    if (diversifiedScore < 55) {
      tips.push("Portfolio is concentrated. Spread across 4-6 asset classes.");
    }
    if (indiaEquityShare < recommended.indiaShare - 10) {
      tips.push("Increase India equity share while domestic trend is stronger.");
    }
    if (indiaEquityShare > recommended.indiaShare + 10) {
      tips.push("Reduce India concentration to balance global diversification.");
    }

    return tips.length
      ? tips
      : ["Allocation looks diversified for current Indian and global market trends."];
  }, [
    total,
    equity,
    crypto,
    debt,
    gold,
    cash,
    realEstate,
    diversifiedScore,
    indiaEquityShare,
    recommended,
    marketPulse,
  ]);

  const applyRecommendations = () => {
    setEquity(recommended.equity);
    setDebt(recommended.debt);
    setGold(recommended.gold);
    setRealEstate(recommended.realEstate);
    setCrypto(recommended.crypto);
    setCash(recommended.cash);
    setIndiaEquityShare(recommended.indiaShare);
  };

  const handleCasAnalyze = async () => {
    if (!casFile) return;
    setCasLoading(true);
    setCasError(null);
    try {
      const text = await extractTextFromPdf(casFile, casPassword.trim());
      const summary = extractAllocationFromText(text);
      setCasSummary(summary);
      setEquity(summary.allocation.equity);
      setDebt(summary.allocation.debt);
      setGold(summary.allocation.gold);
      setRealEstate(summary.allocation.realEstate);
      setCrypto(summary.allocation.crypto);
      setCash(summary.allocation.cash);
    } catch (error: any) {
      setCasError(error?.message || "Unable to parse CAS file.");
    } finally {
      setCasLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const colors = {
      slate: rgb(0.06, 0.09, 0.16),
      text: rgb(0.07, 0.09, 0.13),
      muted: rgb(0.42, 0.47, 0.55),
      accent: rgb(0.38, 0.4, 0.96),
      surface: rgb(1, 1, 1),
      background: rgb(0.97, 0.98, 0.99),
    };

    page.drawRectangle({ x: 0, y: 0, width, height, color: colors.background });
    page.drawRectangle({ x: 32, y: height - 140, width: width - 64, height: 100, color: colors.slate });
    page.drawText("MarketCrashGuard Action Plan", {
      x: 52,
      y: height - 90,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText(`Generated on ${new Date().toLocaleDateString("en-US")} | Mode: ${finalMode}`, {
      x: 52,
      y: height - 115,
      size: 10,
      font,
      color: rgb(0.8, 0.82, 0.9),
    });

    let cursorY = height - 170;
    const sectionGap = 16;
    const sectionWidth = width - 64;

    const drawSection = (title: string, rows: Array<[string, string]>) => {
      const rowHeight = 16;
      const sectionHeight = 30 + rows.length * rowHeight;
      page.drawRectangle({
        x: 32,
        y: cursorY - sectionHeight,
        width: sectionWidth,
        height: sectionHeight,
        color: colors.surface,
      });
      page.drawText(title, {
        x: 52,
        y: cursorY - 22,
        size: 12,
        font: fontBold,
        color: colors.text,
      });

      rows.forEach((row, index) => {
        const rowY = cursorY - 40 - index * rowHeight;
        page.drawText(row[0], { x: 52, y: rowY, size: 10, font, color: colors.muted });
        page.drawText(row[1], { x: width - 160, y: rowY, size: 10, font: fontBold, color: colors.text });
      });

      cursorY -= sectionHeight + sectionGap;
    };

    drawSection("Market Snapshot", [
      ["NSE (1D)", marketPulse ? formatPercent(marketPulse.indices.nifty.change1d) : "-"],
      ["S&P 500 (1D)", marketPulse ? formatPercent(marketPulse.indices.spx.change1d) : "-"],
      ["VIX Level", marketPulse ? marketPulse.indices.vix.price.toFixed(2) : "-"],
      ["USD/INR", marketPulse ? marketPulse.fx.usdinr.price.toFixed(2) : "-"],
      ["Gold (XAU/USD)", marketPulse ? marketPulse.metals.xauusd.price.toFixed(2) : "-"],
      ["BTC (1D)", marketPulse ? formatPercent(marketPulse.crypto.btcusd.change1d) : "-"],
    ]);

    drawSection("Portfolio Summary", [
      ["Equity", `${equity}%`],
      ["Debt/Bonds", `${debt}%`],
      ["Gold/Commodities", `${gold}%`],
      ["REIT/InvIT", `${realEstate}%`],
      ["Crypto", `${crypto}%`],
      ["Cash", `${cash}%`],
      ["India Equity Share", `${indiaEquityShare}%`],
    ]);

    drawSection("Suggested Allocation", [
      ["Equity", `${recommended.equity}%`],
      ["Debt/Bonds", `${recommended.debt}%`],
      ["Gold/Commodities", `${recommended.gold}%`],
      ["REIT/InvIT", `${recommended.realEstate}%`],
      ["Crypto", `${recommended.crypto}%`],
      ["Cash", `${recommended.cash}%`],
      ["India Equity Share", `${recommended.indiaShare}%`],
    ]);

    page.drawRectangle({
      x: 32,
      y: cursorY - 80,
      width: sectionWidth,
      height: 80,
      color: colors.surface,
    });
    page.drawText("Action Guidance", { x: 52, y: cursorY - 22, size: 12, font: fontBold, color: colors.text });
    suggestions.slice(0, 4).forEach((tip, index) => {
      page.drawText(`• ${tip}`, {
        x: 52,
        y: cursorY - 40 - index * 14,
        size: 9,
        font,
        color: colors.muted,
      });
    });
    page.drawText(`Prediction: ${marketPulse?.outlook.prediction || "Trend data unavailable."}`, {
      x: 52,
      y: cursorY - 75,
      size: 9,
      font: fontBold,
      color: colors.accent,
    });

    page.drawText(
      "Risk can be taken at your own risk. This tool is informational and not investment advice.",
      { x: 32, y: 24, size: 8, font, color: colors.muted }
    );

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "marketcrashguard-action-plan.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-secondary/30 text-secondary">
            Portfolio Scanner
          </Badge>
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-white/10 text-muted-foreground">
            India + Global
          </Badge>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">Financial Portfolio Scanner</h1>
        <p className="text-xs text-muted-foreground font-medium">
          Analyze CAS statements or build a plan based on real-time market trends and risk appetite.
        </p>
      </header>

      {marketError && (
        <div className="bg-risk-crash/10 border border-risk-crash/40 rounded-2xl p-4 text-xs text-risk-crash">
          {marketError}
        </div>
      )}
      {marketPulse?.warnings && marketPulse.warnings.length > 0 && (
        <div className="bg-risk-elevated/10 border border-risk-elevated/30 rounded-2xl p-4 text-xs text-risk-elevated space-y-1">
          <p className="font-bold uppercase tracking-widest text-[10px]">Data Warnings</p>
          {marketPulse.warnings.map((warning, index) => (
            <p key={index}>{warning}</p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div data-tour-id="scanner-market-pulse" className="bg-card rounded-[2rem] border border-border p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/20 text-secondary">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Market Pulse</p>
                <p className="text-sm font-bold text-white">Real-time regime blend</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-secondary/30 text-secondary">
              {marketMode} MODE
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-[11px]">
            <MarketChip label="NSE (1D)" value={marketPulse ? formatPercent(marketPulse.indices.nifty.change1d) : "--"} />
            <MarketChip label="S&P 500 (1D)" value={marketPulse ? formatPercent(marketPulse.indices.spx.change1d) : "--"} />
            <MarketChip label="VIX" value={marketPulse ? marketPulse.indices.vix.price.toFixed(2) : "--"} />
            <MarketChip label="USD/INR" value={marketPulse ? marketPulse.fx.usdinr.price.toFixed(2) : "--"} />
          </div>
          <div className="mt-4 text-[11px] text-muted-foreground">
            {marketLoading ? "Loading market data..." : `Prediction: ${marketPulse?.outlook.prediction || "Unavailable."}`}
          </div>
        </div>

        <div data-tour-id="scanner-shock-simulator" className="bg-secondary/10 border border-secondary/30 rounded-[2rem] p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Amazing Feature
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-2">Market Shock Simulator</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Simulate stress to see how allocations shift in a sudden drawdown.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Stress Level</span>
              <span>{stressLevel}%</span>
            </div>
            <Slider value={[stressLevel]} max={100} step={5} onValueChange={(v) => setStressLevel(v[0])} />
            <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-white/10 text-muted-foreground">
              {stressMode} tilt
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cas">CAS Upload</TabsTrigger>
          <TabsTrigger value="plan">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="cas" className="space-y-4">
          <div data-tour-id="scanner-cas-upload" className="bg-card rounded-[2rem] border border-border p-6 space-y-4">
            <div className="flex items-center gap-3">
              <UploadCloud className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm font-bold text-white">Upload CAS Statement</p>
                <p className="text-[11px] text-muted-foreground">Password-protected PDFs supported.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input type="file" accept=".pdf" onChange={(e) => setCasFile(e.target.files?.[0] || null)} />
              <Input
                type="password"
                placeholder="CAS password (if any)"
                value={casPassword}
                onChange={(e) => setCasPassword(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCasAnalyze}
              disabled={!casFile || casLoading}
              className="rounded-full bg-secondary text-secondary-foreground text-[11px] font-black uppercase tracking-widest"
            >
              {casLoading ? "Analyzing..." : "Analyze CAS"}
            </Button>

            {casError && <p className="text-xs text-risk-crash">{casError}</p>}

            {casSummary && (
              <div className="bg-muted/20 border border-border/60 rounded-[1.5rem] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CAS Result</span>
                  <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-white/10 text-muted-foreground">
                    {casSummary.confidence} CONFIDENCE
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Parsed holdings: ₹{casSummary.totalValue.toLocaleString("en-IN")} total value.
                </p>
              </div>
            )}
          </div>

          <div className="bg-card rounded-[2rem] border border-border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CAS Allocation</p>
                <h2 className="text-lg font-black text-white">Asset Mix</h2>
              </div>
              <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-white/10 text-muted-foreground">
                Total {total}%
              </Badge>
            </div>

            <AllocationSlider label="Equity" value={equity} setValue={setEquity} />
            <AllocationSlider label="Debt / Bonds" value={debt} setValue={setDebt} />
            <AllocationSlider label="Gold / Commodities" value={gold} setValue={setGold} />
            <AllocationSlider label="REIT / InvIT" value={realEstate} setValue={setRealEstate} />
            <AllocationSlider label="Crypto" value={crypto} setValue={setCrypto} />
            <AllocationSlider label="Cash" value={cash} setValue={setCash} />
          </div>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <div className="bg-card rounded-[2rem] border border-border p-6 space-y-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm font-bold text-white">Plan Builder</p>
                <p className="text-[11px] text-muted-foreground">Set your risk appetite and build an action plan.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Risk Appetite</span>
                <span>{riskAppetite}%</span>
              </div>
              <Slider value={[riskAppetite]} max={100} step={5} onValueChange={(v) => setRiskAppetite(v[0])} />
              <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-white/10 text-muted-foreground">
                {appetiteMode} appetite
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <AllocationSlider label="Equity" value={equity} setValue={setEquity} />
                <AllocationSlider label="Debt / Bonds" value={debt} setValue={setDebt} />
                <AllocationSlider label="Gold / Commodities" value={gold} setValue={setGold} />
              </div>
              <div className="space-y-4">
                <AllocationSlider label="REIT / InvIT" value={realEstate} setValue={setRealEstate} />
                <AllocationSlider label="Crypto" value={crypto} setValue={setCrypto} />
                <AllocationSlider label="Cash" value={cash} setValue={setCash} />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>India Equity Share</span>
                <span>{indiaEquityShare}%</span>
              </div>
              <Slider value={[indiaEquityShare]} max={100} step={5} onValueChange={(v) => setIndiaEquityShare(v[0])} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card rounded-[2rem] border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Diversification Score
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-white/10 text-muted-foreground">
                  {diversifiedScore}/100
                </Badge>
              </div>
              <Progress value={diversifiedScore} className="h-2" />
              <p className="text-[11px] text-muted-foreground">
                Higher score indicates broader asset-class spread and lower concentration risk.
              </p>
            </div>

            <div className="bg-card rounded-[2rem] border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suggested Allocation</p>
                  <h3 className="text-lg font-black text-white">{finalMode} Mix</h3>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-secondary/30 text-secondary">
                  Auto
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <RecommendStat label="Equity" value={`${recommended.equity}%`} />
                <RecommendStat label="Debt" value={`${recommended.debt}%`} />
                <RecommendStat label="Gold" value={`${recommended.gold}%`} />
                <RecommendStat label="REIT/InvIT" value={`${recommended.realEstate}%`} />
                <RecommendStat label="Crypto" value={`${recommended.crypto}%`} />
                <RecommendStat label="Cash" value={`${recommended.cash}%`} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Auto-Rebalance</span>
                  <Switch checked={showAutoRebalance} onCheckedChange={setShowAutoRebalance} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={applyRecommendations}
                  disabled={!showAutoRebalance}
                  className="rounded-full border-secondary/40 text-[10px] font-black uppercase tracking-widest"
                >
                  Apply Mix
                </Button>
              </div>

              <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-[11px] text-muted-foreground">
                Recommended India equity share: <span className="text-white font-bold">{recommended.indiaShare}%</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className="bg-card rounded-[2rem] border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-secondary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Diversification Guidance
          </span>
        </div>
        <div className="space-y-2">
          {suggestions.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 bg-muted/20 border border-border/60 rounded-[1.25rem] px-4 py-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-secondary" />
              <p className="text-sm text-white/90 leading-snug">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/20 rounded-[2rem] border border-border/60 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-secondary mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Risk Note</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Risk can be taken at your own risk. This tool is informational and not investment advice.
            </p>
          </div>
        </div>
      </div>

      <div data-tour-id="scanner-next-action" className="bg-secondary/10 border border-secondary/20 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Next Step</p>
          <h3 className="text-lg font-black text-white">Export your suggested mix</h3>
          <p className="text-[11px] text-muted-foreground">Create a detailed PDF action plan with realtime context.</p>
        </div>
        <Button
          onClick={handleGeneratePlan}
          className="rounded-full bg-secondary text-secondary-foreground text-[11px] font-black uppercase tracking-widest"
        >
          Generate Action Plan <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function MarketChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-[10px] font-black text-white">{value}</span>
    </div>
  );
}

function AllocationSlider({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-xl font-black text-white">{value}%</span>
      </div>
      <Slider value={[value]} max={100} step={1} onValueChange={(v) => setValue(v[0])} />
    </div>
  );
}

function RecommendStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-xl border border-border/70 bg-muted/20 px-3 py-2")}>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

async function extractTextFromPdf(file: File, password?: string) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data, password: password || undefined });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += `${pageText}\n`;
  }
  return fullText;
}

function extractAllocationFromText(text: string): CasSummary {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const schemeBreakdown = extractSchemeValuationAllocation(text);
  if (schemeBreakdown) {
    return schemeBreakdown;
  }
  const assetClass = extractAssetClassTable(text);
  if (assetClass) {
    return assetClass;
  }
  const buckets: Record<keyof Allocation, { value: number; isPercent: boolean }[]> = {
    equity: [],
    debt: [],
    gold: [],
    realEstate: [],
    crypto: [],
    cash: [],
  };

  const rules: Array<[keyof Allocation, RegExp[]]> = [
    ["equity", [/equity/i, /stock/i, /shares/i, /mutual fund/i, /nifty/i, /sensex/i]],
    ["debt", [/bond/i, /debt/i, /fixed income/i, /debenture/i, /fd/i, /gilt/i]],
    ["gold", [/gold/i, /sgb/i, /silver/i, /commodity/i]],
    ["realEstate", [/reit/i, /invit/i, /real estate/i, /property/i]],
    ["crypto", [/bitcoin/i, /ethereum/i, /crypto/i]],
    ["cash", [/cash/i, /bank balance/i, /savings/i, /liquid/i]],
  ];

  for (const line of lines) {
    const valueMatch = line.match(/([\d,.]+)\s*%/);
    const numberMatch = line.match(/(?:₹|rs\.?|inr\s?)?([\d,]+(?:\.\d+)?)/i);
    for (const [bucket, patterns] of rules) {
      if (patterns.some((pattern) => pattern.test(line))) {
        if (valueMatch) {
          buckets[bucket].push({ value: parseNumber(valueMatch[1]), isPercent: true });
        } else if (numberMatch) {
          buckets[bucket].push({ value: parseNumber(numberMatch[1]), isPercent: false });
        }
      }
    }
  }

  const percentTotals: Allocation = { ...emptyAllocation };
  const amountTotals: Allocation = { ...emptyAllocation };

  (Object.keys(buckets) as Array<keyof Allocation>).forEach((key) => {
    buckets[key].forEach((entry) => {
      if (entry.isPercent) {
        percentTotals[key] += entry.value;
      } else {
        amountTotals[key] += entry.value;
      }
    });
  });

  const percentSum = Object.values(percentTotals).reduce((acc, value) => acc + value, 0);
  const amountSum = Object.values(amountTotals).reduce((acc, value) => acc + value, 0);

  let allocation: Allocation = { ...emptyAllocation };
  let confidence: CasSummary["confidence"] = "LOW";

  if (percentSum > 0) {
    allocation = normalizeAllocation(percentTotals);
    confidence = percentSum >= 90 ? "HIGH" : "MEDIUM";
  } else if (amountSum > 0) {
    const normalized = normalizeAllocation(amountTotals);
    allocation = normalized;
    confidence = amountSum > 0 ? "MEDIUM" : "LOW";
  }

  return {
    allocation,
    totalValue: Math.round(amountSum),
    confidence,
  };
}

function normalizeAllocation(allocation: Allocation): Allocation {
  const total = Object.values(allocation).reduce((acc, value) => acc + value, 0) || 1;
  const keys = Object.keys(allocation) as Array<keyof Allocation>;
  const raw = keys.map((key) => ({
    key,
    value: (allocation[key] / total) * 100,
  }));

  const floored = raw.map((entry) => ({
    ...entry,
    rounded: Math.floor(entry.value),
    remainder: entry.value - Math.floor(entry.value),
  }));

  let sum = floored.reduce((acc, entry) => acc + entry.rounded, 0);
  let remainder = 100 - sum;
  const sorted = [...floored].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < sorted.length && remainder > 0; i += 1) {
    sorted[i].rounded += 1;
    remainder -= 1;
  }

  const normalized: Allocation = { ...emptyAllocation };
  sorted.forEach((entry) => {
    normalized[entry.key] = entry.rounded;
  });
  return normalized;
}

function parseNumber(value: string) {
  const numeric = value.replace(/,/g, "");
  const parsed = Number.parseFloat(numeric);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractSchemeValuationAllocation(text: string): CasSummary | null {
  const totals: Allocation = { ...emptyAllocation };
  let totalValue = 0;
  let found = false;

  // CAMS consolidated summary format
  const camsRegex =
    /(\d{4,}\/?.*?)\s+([\d,]+(?:\.\d+)?)\s+([A-Z0-9]+\s*-\s*[^\d]+?)\s+([\d,]+\.\d+)\s+\d{2}-[A-Za-z]{3}-\d{4}\s+[\d,]+\.\d+\s+\w+\s+(INF[0-9A-Z]{9,})\s+([\d,]+(?:\.\d+)?)/g;

  let match;
  while ((match = camsRegex.exec(text)) !== null) {
    const marketValue = parseNumber(match[2]);
    const schemeName = match[3].toLowerCase();
    if (marketValue <= 0) continue;

    const category = classifyScheme(schemeName);
    totalValue += marketValue;
    found = true;

    if (category === "equity") totals.equity += marketValue;
    if (category === "debt") totals.debt += marketValue;
    if (category === "hybrid") {
      totals.equity += marketValue * 0.65;
      totals.debt += marketValue * 0.35;
    }
    if (category === "conservative") {
      totals.equity += marketValue * 0.3;
      totals.debt += marketValue * 0.7;
    }
    if (category === "gold") totals.gold += marketValue;
    if (category === "cash") totals.cash += marketValue;
  }

  const totalLineMatch = text.match(/\\bTotal\\s+([\\d,]+(?:\\.\\d+)?)\\s+[\\d,]+(?:\\.\\d+)?/i);
  if (totalLineMatch) {
    totalValue = parseNumber(totalLineMatch[1]) || totalValue;
  }

  if (!found) {
    const lines = text.split(/\\r?\\n/);
    const schemeLines = lines.filter((line) =>
      / - /.test(line) && /INF[0-9A-Z]{9,}/.test(line) && !/Grand Total/i.test(line)
    );

    schemeLines.forEach((line) => {
      const numbers = line.match(/[\\d,]+(?:\\.\\d+)?/g) || [];
      if (numbers.length < 4) return;
      const valuation = parseNumber(numbers[3]);
      if (valuation <= 0) return;

      const namePart = line.split("ISIN")[0].toLowerCase();
      const category = classifyScheme(namePart);

      totalValue += valuation;
      found = true;
      if (category === "equity") totals.equity += valuation;
      if (category === "debt") totals.debt += valuation;
      if (category === "hybrid") {
        totals.equity += valuation * 0.65;
        totals.debt += valuation * 0.35;
      }
      if (category === "conservative") {
        totals.equity += valuation * 0.3;
        totals.debt += valuation * 0.7;
      }
      if (category === "gold") totals.gold += valuation;
      if (category === "cash") totals.cash += valuation;
    });
  }

  if (!found || totalValue <= 0) return null;

  const allocation = normalizeAllocation(totals);
  return {
    allocation,
    totalValue: Math.round(totalValue),
    confidence: "HIGH",
  };
}

function classifyScheme(name: string) {
  if (/(gold|commodity)/i.test(name)) return "gold";
  if (/(liquid|money market|ultra short|overnight|cash)/i.test(name)) return "cash";
  if (/(debt|bond|income|gilt|fixed maturity|short duration|corporate bond)/i.test(name)) return "debt";
  if (/(conservative hybrid)/i.test(name)) return "conservative";
  if (/(hybrid|balanced advantage|multi asset)/i.test(name)) return "hybrid";
  if (/(elss|tax saver|equity|large cap|mid cap|small cap|index|nifty|sensex)/i.test(name)) return "equity";
  return "equity";
}

function extractAssetClassTable(text: string): CasSummary | null {
  const allocationFromTable: Allocation = { ...emptyAllocation };
  let found = false;

  const totalValueMatch =
    text.match(/Total Portfolio Value[^\d]*([\d,]+(?:\.\d+)?)/i) ||
    text.match(/Grand Total[^\d]*([\d,]+(?:\.\d+)?)/i);
  const totalValue = totalValueMatch ? parseNumber(totalValueMatch[1]) : 0;

  const assetIdx = text.toLowerCase().lastIndexOf("assets class");
  const scopedText = assetIdx >= 0 ? text.slice(assetIdx, assetIdx + 800) : text;

  const labelMatchers: Array<[keyof Allocation, RegExp]> = [
    ["equity", /Mutual Fund Folios\s+([₹`\\s]*[\d,]+(?:\.\d+)?)\s+([\d.]+)/i],
    ["equity", /Equity\s+([\d,]+(?:\.\d+)?)\s+([\d.]+)/i],
    ["debt", /Debt\s*\/?\s*Bonds?\s+([\d,]+(?:\.\d+)?)\s+([\d.]+)/i],
    ["gold", /Gold\s*\/?\s*Commodities?\s+([\d,]+(?:\.\d+)?)\s+([\d.]+)/i],
    ["realEstate", /REIT\s*\/?\s*InvIT\s+([\d,]+(?:\.\d+)?)\s+([\d.]+)/i],
    ["crypto", /Crypto\s+([\d,]+(?:\.\d+)?)\s+([\d.]+)/i],
    ["cash", /Cash\s+([\d,]+(?:\.\d+)?)\s+([\d.]+)/i],
  ];

  labelMatchers.forEach(([bucket, regex]) => {
    const match = scopedText.match(regex);
    if (match) {
      const percent = parseNumber(match[2]);
      allocationFromTable[bucket] += percent;
      found = true;
    }
  });

  if (!found) return null;

  const percentSum = Object.values(allocationFromTable).reduce((acc, value) => acc + value, 0);
  const allocation = percentSum > 0 ? normalizeAllocation(allocationFromTable) : { ...emptyAllocation };
  return {
    allocation,
    totalValue: Math.round(totalValue),
    confidence: percentSum >= 90 ? "HIGH" : "MEDIUM",
  };
}
