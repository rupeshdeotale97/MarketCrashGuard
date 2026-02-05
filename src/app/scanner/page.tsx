"use client";

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ExposureStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ScannerPage() {
  const [equity, setEquity] = useState(50);
  const [debt, setDebt] = useState(30);
  const [crypto, setCrypto] = useState(10);
  const [cash, setCash] = useState(10);
  const [leverage, setLeverage] = useState(false);
  const { toast } = useToast();

  const calculateStatus = (): ExposureStatus => {
    const riskExposure = equity + crypto;
    if (leverage || riskExposure > 70) return 'OVEREXPOSED';
    if (riskExposure < 30) return 'DEFENSIVE';
    return 'BALANCED';
  };

  const handleLeverageToggle = (checked: boolean) => {
    setLeverage(checked);
    if (checked) {
      toast({
        variant: "destructive",
        title: "High Risk Warning",
        description: "Leverage significantly increases liquidation risk.",
      });
    }
  };

  const status = calculateStatus();
  const total = equity + debt + crypto + cash;

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Exposure Scanner</h1>
        <p className="text-xs text-muted-foreground font-medium">Input your profile to evaluate risk exposure levels.</p>
      </header>

      {/* Result Card */}
      <div className={cn(
        "rounded-[2.5rem] p-8 flex flex-col items-center text-center border transition-all duration-700 shadow-2xl",
        status === 'OVEREXPOSED' ? "bg-risk-crash/5 border-risk-crash/30" : 
        status === 'DEFENSIVE' ? "bg-risk-low/5 border-risk-low/30" : 
        "bg-secondary/5 border-secondary/30"
      )}>
        <div className={cn(
          "p-5 rounded-full mb-4",
          status === 'OVEREXPOSED' ? "bg-risk-crash/20 text-risk-crash" : 
          status === 'DEFENSIVE' ? "bg-risk-low/20 text-risk-low" : 
          "bg-secondary/20 text-secondary"
        )}>
          {status === 'OVEREXPOSED' ? <AlertTriangle className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
        </div>
        <h2 className={cn("text-2xl font-black uppercase tracking-tighter mb-1", 
          status === 'OVEREXPOSED' ? "text-risk-crash" : 
          status === 'DEFENSIVE' ? "text-risk-low" : 
          "text-secondary"
        )}>
          {status}
        </h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Calculated Profile</p>
      </div>

      {/* Input Form */}
      <div className="bg-card rounded-[2rem] border border-border p-6 space-y-8">
        <ScannerInput label="Equity exposure" value={equity} setValue={setEquity} />
        <ScannerInput label="Debt / Fixed income" value={debt} setValue={setDebt} />
        <ScannerInput label="Crypto exposure" value={crypto} setValue={setCrypto} />
        <ScannerInput label="Cash reserves" value={cash} setValue={setCash} />

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex flex-col">
            <span className="font-bold text-sm">Use Leverage?</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Margin / Borrowed Funds</span>
          </div>
          <Switch checked={leverage} onCheckedChange={handleLeverageToggle} />
        </div>

        {total !== 100 && (
          <p className="text-[10px] text-risk-high font-bold uppercase text-center animate-pulse">
            Total Assets: {total}% (Must equal 100% for accuracy)
          </p>
        )}
      </div>

      <div className="bg-muted/10 rounded-2xl p-5 border border-border flex gap-3">
        <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed text-muted-foreground font-medium italic">
          Disclaimer: This is an informational risk-awareness tool only. We do not provide asset allocation or investment advice.
        </p>
      </div>
    </div>
  );
}

function ScannerInput({ label, value, setValue }: { label: string, value: number, setValue: (v: number) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-lg font-black text-white">{value}%</span>
      </div>
      <Slider 
        value={[value]} 
        max={100} 
        step={5} 
        onValueChange={(v) => setValue(v[0])}
        className={cn("cursor-pointer")}
      />
    </div>
  );
}
