
"use client";

import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Loader2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { getDailyRiskData } from '@/lib/mock-data';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type AlignmentStatus = 'ALIGNED' | 'AGGRESSIVE' | 'DEFENSIVE';

// Helper to robustly get allocation values from API response
const getAllocationValue = (
  result: Record<string, any>,
  keys: string[]
): number => {
  for (const key of keys) {
    const resultKey = Object.keys(result).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    if (resultKey && result[resultKey]) {
      const value = parseFloat(String(result[resultKey]).replace(/[^\d.-]/g, ''));
      if (!isNaN(value)) return value;
    }
  }
  return 0;
};

export default function ScannerPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [equity, setEquity] = useState(50);
  const [debt, setDebt] = useState(30);
  const [crypto, setCrypto] = useState(10);
  const [cash, setCash] = useState(10);
  const [leverage, setLeverage] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [filePassword, setFilePassword] = useState('');
  
  const marketData = getDailyRiskData();

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
    setEquity(50); setDebt(30); setCrypto(10); setCash(10); setLeverage(false); setFilePassword('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.csv', '.xlsx', '.xls', '.pdf'];
    const fileType = '.' + file.name.split('.').pop();
    if (!allowedTypes.includes(fileType)) {
      toast({
        variant: "destructive",
        title: "Unsupported File",
        description: "Please upload a .CSV, Excel, or .PDF export.",
      });
      return;
    }

    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', filePassword);

    try {
      const response = await fetch('/api/analyse-cas', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'File processing failed');
      }

      const result = await response.json();
      
      setEquity(Math.round(getAllocationValue(result, ['Equity'])));
      setDebt(Math.round(getAllocationValue(result, ['Debt/Bonds', 'Debt'])));
      setCrypto(Math.round(getAllocationValue(result, ['Crypto'])));
      setCash(Math.round(getAllocationValue(result, ['Cash'])));
      
      toast({
        title: "Analysis Complete",
        description: "Portfolio distribution extracted successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Could not read file. Ensure password is correct.",
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

      <div className="bg-secondary/5 border border-dashed border-secondary/20 rounded-[2rem] p-8 flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className={cn(
            "p-4 rounded-full bg-secondary/10 text-secondary transition-all",
            isScanning && "animate-pulse scale-110 bg-secondary/20"
          )}>
            {isScanning ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileText className="w-8 h-8" />}
          </div>
        </div>
        
        <div className="w-full max-w-xs space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-black text-white">Analyze Statement</h3>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Upload a .CSV, Excel or .PDF export.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">File Password (Optional)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input 
                  type="password"
                  placeholder="Password for protected file"
                  value={filePassword}
                  onChange={(e) => setFilePassword(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background border-border text-xs focus:ring-secondary/20"
                />
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".csv,.xlsx,.xls,.pdf"
            />
            
            <Button 
              variant="outline" 
              disabled={isScanning}
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-secondary/40 h-12 text-[10px] font-black uppercase tracking-widest hover:bg-secondary/10 shadow-lg"
            >
              {isScanning ? "Processing..." : "Select Statement File"}
            </Button>
          </div>
        </div>
      </div>

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

      <div className="bg-card rounded-[2rem] border border-border p-8 space-y-8 shadow-xl">
        <div className="space-y-6">
          <AllocationInput label="Equity" value={equity} setValue={setEquity} />
          <AllocationInput label="Debt / Bonds" value={debt} setValue={setDebt} />
          <AllocationInput label="Crypto" value={crypto} setValue={setCrypto} />
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
            {/* Content for total mismatch */}
          </div>
        )}
      </div>

      {/* ... rest of the component ... */}
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
