"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { explainSuggestedActions } from '@/ai/flows/explain-suggested-actions';
import { Loader2, ShieldQuestion } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ActionButtonProps {
  riskFactors: string;
  suggestedActions: string[];
}

export function ActionButton({ riskFactors, suggestedActions }: ActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [explanations, setExplanations] = useState<string[] | null>(null);
  const [open, setOpen] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      const result = await explainSuggestedActions({
        marketRiskFactors: riskFactors,
        suggestedActions,
      });
      setExplanations(result.detailedExplanations);
      setOpen(true);
    } catch (error) {
      console.error("Failed to get AI guidance", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleAction} 
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-semibold flex gap-2 items-center"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShieldQuestion className="w-5 h-5" />
        )}
        What should I do today?
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Risk Guidance</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Personalized calm guidance based on current market risk indicators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {explanations?.map((exp, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-xl border border-border">
                <p className="text-sm leading-relaxed text-foreground">{exp}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}