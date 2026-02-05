"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Info, 
  FileText, 
  Loader2,
  FileSearch,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getDailyRiskData } from '@/lib/mock-data';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeStatement } from '@/ai/flows/analyze-statement-flow';

type AlignmentStatus = 'ALIGNED' | 'AGGRESSIVE' | 'DEFENSIVE';

export default function ScannerPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // STRICT PRIVACY: State only, no persistence
  const [equity, setEquity] = useState(50);
  const [debt, setDebt] = useState(30);
  const [crypto, setCrypto] = useState(10);
  const [cash, setCash] = useState(10);
  const [leverage, setLeverage] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const marketData = getDailyRiskData();

  // Reset state on unmount or background (session only)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        resetPortfolio();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const resetPortfolio = () => {
    setEquity(50); setDebt(30); setCrypto(10); setCash(10); setLeverage(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support CSV and common text-based formats for analysis
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
    const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv';
    
    if (!isCSV) {
      toast({
        variant: "destructive",
        title: "Unsupported File",
        description: "Please upload a .CSV export of your statement.",
      });
      return;
    }

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const textContent = event.target?.result as string;
      try {
        // AI analyzes the raw CSV text
        const result = await analyzeStatement(textContent);
        
        setEquity(Math.round(result.equity));
        setDebt(Math.round(result.debt));
        setCrypto(Math.round(result.crypto));
        setCash(Math.round(result.cash));
        
        toast({
          title: "Analysis Complete",
          description: "Portfolio distribution extracted from CSV.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not read CSV structure. Please check the file or enter values manually.",
        });
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const calculateAlignment = (): AlignmentStatus => {
    const highRiskExposure = equity + crypto;
    const isHighRiskEnvironment = marketData.crashConfirmed || marketData.riskJumpDay || marketData.globalRisk === 'STRESSED';
    
    if (isHighRiskEnvironment) {
      if (leverage || highRiskExposure > 30) return 'AGGRESSIVE';
      if (highRiskExposure < 15) return 'DEFENSIVE';
      return 'ALIGNED';
    } else {
      if (highRiskExposure > 75) return 'AGGRESSIVE';
      if (highRiskExposure < 30) return 'DEFENSIVE';
      return 'ALIGNED';
    }
  };

  const status = calculateAlignment();
  const total = equity + debt + crypto + cash;

  const getSuggestions = () => {
    const suggestions = [];
    if (leverage) suggestions.push("Leverage tends to amplify losses during stress phases.");
    if (equity + crypto > 60) suggestions.push("In elevated-risk environments, high equity exposure may increase volatility.");
    if (cash < 20) suggestions.push("Higher cash buffers historically help during unstable periods.");
    if (crypto > 15) suggestions.push("Crypto exposure behaves more aggressively during global risk events.");
    if (marketData.crashConfirmed && status === 'AGGRESSIVE') suggestions.push("During confirmed crashes, capital preservation historically becomes the primary objective.");
    
    return suggestions.length > 0 ? suggestions : ["Your current allocation is within historical safety bounds for this regime."];
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-secondary/30 text-secondary">
            Private Session
          </Badge>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mt-1">Portfolio Scanner</h1>
        <p className="text-xs text-muted-foreground font-medium">Evaluate risk alignment with today's market regime.</p>
      </header>

      {/* CSV File Scanner Trigger */}
      <div className="bg-secondary/5 border border-dashed border-secondary/20 rounded-[2rem] p-6 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className={cn(
            "p-4 rounded-full bg-secondary/10 text-secondary transition-all",
            isScanning && "animate-pulse scale-110 bg-secondary/20"
          )}>
            {isScanning ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileText className="w-8 h-8" />}
          </div>
          {isScanning && (
            <div className="absolute inset-0 border-2 border-secondary rounded-full animate-ping opacity-20" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-white">Analyze CSV Statement</h3>
          <p className="text-[10px] text-muted-foreground font-medium max-w-[200px] mx-auto leading-relaxed">
            Upload your broker's .CSV export to auto-fill percentages.
          </p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".csv"
        />
        <Button 
          variant="outline" 
          disabled={isScanning}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-secondary/40 h-10 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-secondary/10"
        >
          {isScanning ? "Analyzing Data..." : "Select CSV File"}
        </Button>
      </div>

      {/* Evaluation Result */}
      <div className={cn(
        "rounded-[2.5rem] p-8 flex flex-col items-center text-center border transition-all duration-700 shadow-2xl relative overflow-hidden",
        status === 'AGGRESSIVE' ? "bg-risk-crash/10 border-risk-crash/30" : 
        status === 'DEFENSIVE' ? "bg-risk-low/10 border-risk-low/30" : 
        "bg-secondary/10 border-secondary/30"
      )}>
        <div className={cn(
          "p-5 rounded-full mb-4 shadow-inner",
          status === 'AGGRESSIVE' ? "bg-risk-crash/20 text-risk-crash" : 
          status === 'DEFENSIVE' ? "bg-risk-low/20 text-risk-low" : 
          "bg-secondary/20 text-secondary"
        )}>
          {status === 'AGGRESSIVE' ? <AlertTriangle className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
        </div>
        
        <h2 className={cn("text-2xl font-black uppercase tracking-tighter mb-1", 
          status === 'AGGRESSIVE' ? "text-risk-crash" : 
          status === 'DEFENSIVE' ? "text-risk-low" : 
          "text-secondary"
        )}>
          {status === 'ALIGNED' ? 'ALIGNED WITH MARKET' : `${status} FOR REGIME`}
        </h2>
        
        <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full mt-4 overflow-hidden flex">
          <div className={cn("h-full", status === 'DEFENSIVE' ? 'w-1/3 bg-risk-low' : status === 'ALIGNED' ? 'w-2/3 bg-secondary' : 'w-full bg-risk-crash')} />
        </div>
        <div className="flex justify-between w-full max-w-[200px] mt-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest">
          <span>Defensive</span>
          <span>Aggressive</span>
        </div>
      </div>

      {/* Input Module */}
      <div className="bg-card rounded-[2rem] border border-border p-8 space-y-8 shadow-xl">
        <div className="space-y-6">
          <AllocationInput label="Equity" value={equity} setValue={setEquity} />
          <AllocationInput label="Debt / Bonds" value={debt} setValue={setDebt} />
          <AllocationInput label="Crypto" value={crypto} setValue={setEquity} />
          <AllocationInput label="Cash" value={cash} setValue={setCash} />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white">Use Leverage?</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Margin / Borrowed</span>
          </div>
          <Switch checked={leverage} onCheckedChange={setLeverage} className="data-[state=checked]:bg-secondary" />
        </div>

        {total !== 100 && (
          <div className="bg-risk-high/10 border border-risk-high/30 rounded-xl p-3 flex items-center gap-2 justify-center">
            <Info className="w-3 h-3 text-risk-high" />
            <p className="text-[10px] text-risk-high font-black uppercase tracking-widest">
              Total: {total}% (Target 100%)
            </p>
          </div>
        )}
      </div>

      {/* Educational Suggestions */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Considerations</h3>
        <div className="space-y-2">
          {getSuggestions().map((suggestion, i) => (
            <div key={i} className="bg-muted/20 border border-border/60 rounded-2xl p-4 flex gap-3 items-start group hover:border-secondary/30 transition-all">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed text-muted-foreground group-hover:text-white transition-colors">
                {suggestion}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-secondary/5 border border-dashed border-secondary/20 rounded-2xl p-5 mt-4">
        <p className="text-[10px] leading-relaxed text-muted-foreground font-semibold italic text-center">
          "This tool is educational only. It does not provide investment advice. Portfolio inputs are not saved or tracked."
        </p>
      </div>

      <footer className="mt-4 pb-8 text-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground">Local Session Intelligence • Private Protocol</p>
      </footer>
    </div>
  );
}

function AllocationInput({ label, value, setValue }: { label: string, value: number, setValue: (v: number) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-xl font-black text-white">{value}%</span>
      </div>
      <Slider 
        value={[value]} 
        max={100} 
        step={5} 
        onValueChange={(v) => setValue(v[0])}
        className="cursor-pointer"
      />
    </div>
  );
}
