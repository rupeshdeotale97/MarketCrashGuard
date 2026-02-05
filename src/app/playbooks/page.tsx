"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ShieldAlert, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';

const playbooks = [
  {
    id: "equity",
    title: "Equity Market Crash",
    description: "Systemic decline in US/Global stocks.",
    whatToDo: ["Move to defensive sectors", "Monitor credit spreads daily", "Maintain cash reserves"],
    whatNotToDo: ["Panic sell bottom-tier stocks", "Add leverage to 'buy the dip'", "Ignore liquidity warnings"],
    mistakes: "Expecting a V-shape recovery instantly.",
    duration: "Typically 6 to 18 months."
  },
  {
    id: "crypto",
    title: "Crypto Liquidity Event",
    description: "Rapid deleveraging in digital assets.",
    whatToDo: ["Prioritize stablecoin security", "Withdraw from high-risk pools", "Focus on BTC/ETH dominance"],
    whatNotToDo: ["Hedge using high leverage", "FOMO into dead cat bounces", "Store funds on small exchanges"],
    mistakes: "Underestimating correlation to equity.",
    duration: "Intense spikes; 3 to 6 months."
  },
  {
    id: "liquidity",
    title: "Global Liquidity Shock",
    description: "Cash becomes scarce; everything falls.",
    whatToDo: ["Cash is King - preserve capital", "Stay patient - wait for stability", "Review margin requirements"],
    whatNotToDo: ["Buy illiquid assets", "Hope for a pivot too early", "Forget to manage stop losses"],
    mistakes: "Buying before the credit cycle bottom.",
    duration: "Unpredictable; usually 3-12 months."
  }
];

export default function PlaybooksPage() {
  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Crash Playbooks</h1>
        <p className="text-xs text-muted-foreground font-medium">Non-emotional guidance for stress scenarios.</p>
      </header>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {playbooks.map((book) => (
            <AccordionItem key={book.id} value={book.id} className="border rounded-[2rem] bg-card px-6 overflow-hidden border-border transition-all hover:border-secondary/30 shadow-lg">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-white">{book.title}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{book.description}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-risk-low mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">What to Do</span>
                    </div>
                    {book.whatToDo.map((item, i) => (
                      <p key={i} className="text-[11px] font-semibold text-white/80 leading-tight">• {item}</p>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-risk-crash mb-1">
                      <XCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">What NOT to Do</span>
                    </div>
                    {book.whatNotToDo.map((item, i) => (
                      <p key={i} className="text-[11px] font-semibold text-white/80 leading-tight">• {item}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border/40">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-black uppercase text-secondary tracking-widest block mb-1">Common Mistakes</span>
                      <p className="text-[11px] font-medium text-muted-foreground">{book.mistakes}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-black uppercase text-secondary tracking-widest block mb-1">Typical Duration</span>
                      <p className="text-[11px] font-medium text-muted-foreground">{book.duration}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="bg-muted/10 rounded-2xl p-5 border border-dashed border-border mt-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed text-center font-bold italic">
          "The stock market is a device for transferring money from the impatient to the patient."
        </p>
      </div>
    </div>
  );
}
