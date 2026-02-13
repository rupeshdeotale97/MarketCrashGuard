"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/lib/onboarding-tour";

type HighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type OnboardingTourProps = {
  open: boolean;
  steps: OnboardingStep[];
  onClose: () => void;
  onComplete: () => void;
  onAction?: (actionId: string) => void;
};

export function OnboardingTour({ open, steps, onClose, onComplete, onAction }: OnboardingTourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<HighlightRect | null>(null);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open || !step?.targetId) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(`[data-tour-id="${step.targetId}"]`) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }

      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      const bounds = el.getBoundingClientRect();
      setRect({
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, step?.targetId]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isLast) onComplete();
        else setIndex((prev) => Math.min(prev + 1, steps.length - 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLast, onClose, onComplete, open, steps.length]);

  const tooltipPosition = useMemo(() => {
    if (typeof window === "undefined") {
      return { top: 24, left: 12, width: 320 };
    }

    const margin = 12;
    const width = Math.min(360, window.innerWidth - 24);

    if (!rect) {
      return {
        top: Math.max(24, window.innerHeight / 2 - 140),
        left: Math.max(margin, (window.innerWidth - width) / 2),
        width,
      };
    }

    const desiredTop = rect.top + rect.height + 14;
    const fitsBottom = desiredTop + 210 < window.innerHeight;
    const useTop = step.placement === "top" || (step.placement !== "bottom" && !fitsBottom);
    const top = useTop ? Math.max(16, rect.top - 220) : desiredTop;
    const left = Math.min(
      window.innerWidth - width - margin,
      Math.max(margin, rect.left + rect.width / 2 - width / 2)
    );

    return { top, left, width };
  }, [rect, step.placement]);

  if (!open || !step) return null;

  return (
    <div className="fixed inset-0 z-[130]">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {rect && (
        <div
          className="pointer-events-none fixed rounded-2xl border-2 border-secondary shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all duration-300"
          style={{
            top: Math.max(0, rect.top - 6),
            left: Math.max(0, rect.left - 6),
            width: rect.width + 12,
            height: rect.height + 12,
          }}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Onboarding tour"
        className="fixed rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
        style={{ top: tooltipPosition.top, left: tooltipPosition.left, width: tooltipPosition.width }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Step {index + 1} of {steps.length}
            </p>
            <button
              onClick={onClose}
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
              aria-label="Skip tour"
            >
              Skip
            </button>
          </div>
          <h3 className="text-base font-black text-foreground">{step.title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
        </div>

        {step.actions && step.actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {step.actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant || "default"}
                onClick={() => onAction?.(action.id)}
                className={cn("rounded-full text-[10px] font-black uppercase tracking-widest")}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={isFirst}
            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
            className="rounded-full text-[10px] font-black uppercase tracking-widest"
          >
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (isLast) onComplete();
              else setIndex((prev) => Math.min(prev + 1, steps.length - 1));
            }}
            className="rounded-full text-[10px] font-black uppercase tracking-widest"
          >
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
