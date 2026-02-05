import { RiskLevel, SystemStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskCardProps {
  label: string;
  status: RiskLevel | SystemStatus;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'LOW':
    case 'VERY_LOW':
    case 'STABLE':
      return 'text-risk-low';
    case 'ELEVATED':
    case 'FRAGILE':
      return 'text-risk-elevated';
    case 'HIGH':
    case 'STRESSED':
      return 'text-risk-high';
    case 'CRASH':
      return 'text-risk-crash';
    default:
      return 'text-muted-foreground';
  }
};

export function RiskCard({ label, status }: RiskCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col items-center justify-center gap-1 text-center">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={cn("text-lg font-bold tracking-tight", getStatusColor(status))}>
        {status.replace('_', ' ')}
      </span>
    </div>
  );
}