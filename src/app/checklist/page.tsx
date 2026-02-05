import { getDailyRiskData } from '@/lib/mock-data';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChecklistPage() {
  const data = getDailyRiskData();
  const factors = data.factors;

  const checklistItems = [
    { label: "Credit Stress", value: factors.creditStress },
    { label: "Volatility Spike", value: factors.volatilitySpike },
    { label: "Liquidity Shock", value: factors.liquidityShock },
    { label: "External Shock", value: factors.externalShock },
  ];

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Crash Checklist</h1>
        <p className="text-sm text-muted-foreground mt-1">Rule-based confirmation criteria.</p>
      </header>

      {/* Status Banner */}
      <div className={cn(
        "rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-center border-2 transition-colors",
        data.crashConfirmed 
          ? "bg-risk-crash/10 border-risk-crash shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
          : "bg-risk-low/5 border-risk-low/20"
      )}>
        <div className={cn(
          "p-4 rounded-full",
          data.crashConfirmed ? "bg-risk-crash/20 text-risk-crash" : "bg-risk-low/20 text-risk-low"
        )}>
          {data.crashConfirmed ? <AlertTriangle className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
        </div>
        <div>
          <h2 className={cn(
            "text-2xl font-black uppercase tracking-tighter",
            data.crashConfirmed ? "text-risk-crash" : "text-risk-low"
          )}>
            {data.crashConfirmed ? "CRASH CONFIRMED" : "CRASH NOT CONFIRMED"}
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1 max-w-[240px]">
            {data.crashConfirmed 
              ? "Multiple system shocks detected. Capital preservation is priority." 
              : "Market conditions do not meet crash threshold criteria."}
          </p>
        </div>
      </div>

      {/* Confirmation List */}
      <div className="bg-card rounded-3xl border border-border divide-y divide-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/30">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conditions Evaluated</span>
        </div>
        {checklistItems.map((item, i) => (
          <div key={i} className="px-6 py-5 flex items-center justify-between">
            <span className="font-semibold text-lg">{item.label}</span>
            {item.value ? (
              <XCircle className="w-6 h-6 text-risk-crash" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-risk-low" />
            )}
          </div>
        ))}
      </div>

      {/* Action Guidance */}
      <div className="flex flex-col gap-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Suggested Guidance</h3>
        <div className="space-y-2">
          {data.action.map((action, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 bg-muted/40 rounded-2xl border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
              <span className="font-medium">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}