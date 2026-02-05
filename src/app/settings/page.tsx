"use client";

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, Bell, ShieldAlert, ExternalLink, Heart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [isTrader, setIsTrader] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handleDonate = (amount: string) => {
    toast({
      title: "Thank You!",
      description: `Your support for ${amount} has been noted. Donations are voluntary and optional.`,
    });
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
      </header>

      {/* Preferences Section */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
        <div className="px-6 py-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{isTrader ? "Trader Mode" : "Investor Mode"}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Profile</span>
            </div>
          </div>
          <Switch 
            checked={isTrader} 
            onCheckedChange={setIsTrader} 
            className="data-[state=checked]:bg-secondary"
          />
        </div>

        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
              < Bell className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Risk Alerts</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Push Notifications</span>
            </div>
          </div>
          <Switch 
            checked={notifications} 
            onCheckedChange={setNotifications}
            className="data-[state=checked]:bg-secondary"
          />
        </div>
      </div>

      {/* Support Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Heart className="w-4 h-4 text-pink-500" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Support CrashGuard</h3>
        </div>
        <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-[2rem] p-6 border border-secondary/20 space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground font-medium">
            CrashGuard is built to reduce panic and protect capital — not to sell trades or fear. If this app helps you stay disciplined, you can support ongoing development.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="rounded-xl font-bold h-12 text-xs" onClick={() => handleDonate("$3")}>$3</Button>
            <Button variant="outline" className="rounded-xl font-bold h-12 text-xs" onClick={() => handleDonate("$5")}>$5</Button>
            <Button variant="outline" className="rounded-xl font-bold h-12 text-xs" onClick={() => handleDonate("$10+")}>$10+</Button>
          </div>
          <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Voluntary • No added features • Just Appreciation
          </p>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <ShieldAlert className="w-4 h-4 text-risk-high" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mandatory Disclaimer</h3>
        </div>
        <div className="bg-muted/30 rounded-3xl p-6 border border-border">
          <p className="text-[11px] leading-relaxed text-muted-foreground font-bold italic">
            This app does not provide investment advice. It is an informational risk-awareness tool only. Users are responsible for all financial decisions.
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-4 flex flex-col gap-3">
        <button className="flex items-center justify-between w-full px-6 py-4 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-border transition-colors group">
          <span className="font-bold text-xs uppercase tracking-widest">Privacy Policy</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white" />
        </button>
        <button className="flex items-center justify-between w-full px-6 py-4 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-border transition-colors group">
          <span className="font-bold text-xs uppercase tracking-widest">Terms of Service</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white" />
        </button>
        <div className="text-center pt-2">
          <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Version 1.2.0 • Build 88</span>
        </div>
      </div>
    </div>
  );
}
