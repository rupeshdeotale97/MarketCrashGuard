"use client";

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, Bell, ShieldAlert, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [isTrader, setIsTrader] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
      </header>

      {/* Preferences Section */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
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

      {/* Disclaimer Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <ShieldAlert className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Legal Disclaimer</h3>
        </div>
        <div className="bg-muted/30 rounded-3xl p-6 border border-border">
          <p className="text-sm leading-relaxed text-muted-foreground">
            CrashGuard is a tool for market risk awareness based on rule-based volatility and credit indicators. 
            <br /><br />
            <strong>Important:</strong> This application does not provide investment, financial, or trading advice. It does not predict future price movements or market direction. Use the information provided at your own discretion and risk.
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-4 flex flex-col gap-4 mb-8">
        <button className="flex items-center justify-between w-full px-6 py-4 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-border transition-colors">
          <span className="font-medium text-sm">Privacy Policy</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="flex items-center justify-between w-full px-6 py-4 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-border transition-colors">
          <span className="font-medium text-sm">Terms of Service</span>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Version 1.0.0 (Build 42)</span>
        </div>
      </div>
    </div>
  );
}
