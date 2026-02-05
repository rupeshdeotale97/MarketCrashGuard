"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { User, Bell, ShieldAlert, Heart, Coffee, Star, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [isTrader, setIsTrader] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [isSupporter, setIsSupporter] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supporterStatus = localStorage.getItem('crashguard_supporter');
    if (supporterStatus === 'true') setIsSupporter(true);
    
    const notificationPref = localStorage.getItem('crashguard_notifications');
    if (notificationPref === 'true') setNotifications(true);

    const modePref = localStorage.getItem('crashguard_mode');
    if (modePref === 'trader') setIsTrader(true);
  }, []);

  const handleModeToggle = (checked: boolean) => {
    setIsTrader(checked);
    localStorage.setItem('crashguard_mode', checked ? 'trader' : 'investor');
    trackEvent('action_click', 'Profile Toggle', { mode: checked ? 'trader' : 'investor' });
    toast({
      title: checked ? "Trader Mode Active" : "Investor Mode Active",
      description: "App guidance will adjust to your profile.",
    });
  };

  const handleNotificationToggle = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('crashguard_notifications', checked ? 'true' : 'false');
    trackEvent('action_click', 'Notification Toggle', { enabled: checked });
    toast({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
    });
  };

  const handleDonateInitiate = (amount: string) => {
    setSelectedAmount(amount);
    setShowDonationDialog(true);
    trackEvent('support_intent', 'Select Amount', { amount });
  };

  const confirmDonation = async () => {
    setIsProcessing(true);
    trackEvent('support_complete', 'Initiate Razorpay', { amount: selectedAmount });
    
    const newEntry = {
      id: Math.random().toString(36).substring(2, 15),
      amount: selectedAmount,
      timestamp: new Date().toISOString(),
      mode: isTrader ? 'Trader' : 'Investor'
    };

    const currentLedger = JSON.parse(localStorage.getItem('crashguard_ledger') || '[]');
    localStorage.setItem('crashguard_ledger', JSON.stringify([newEntry, ...currentLedger]));

    window.open('https://razorpay.me/@poojarupeshdeotale', '_blank');
    
    setTimeout(() => {
      setIsSupporter(true);
      localStorage.setItem('crashguard_supporter', 'true');
      setIsProcessing(false);
      setShowDonationDialog(false);
      toast({ title: "Contribution Noted", description: "Your kindness fuels our research." });
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
        <div className="flex gap-2">
          {isSupporter && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Patron</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
            <Shield className="w-5 h-5 text-muted-foreground/40" />
          </Button>
        </div>
      </header>

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
          <Switch checked={isTrader} onCheckedChange={handleModeToggle} className="data-[state=checked]:bg-secondary" />
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">Risk Alerts</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Notifications</span>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={handleNotificationToggle} className="data-[state=checked]:bg-secondary" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Coffee className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nourish the Research</h3>
        </div>
        <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-[2rem] p-6 border border-secondary/20 space-y-5">
          <p className="text-xs leading-relaxed text-muted-foreground font-medium">
            If our playbooks and cycles have served as your shield, consider fueling further intelligence with a coffee or green tea.
          </p>
          
          {isSupporter ? (
            <div className="bg-background/40 rounded-2xl p-4 flex flex-col items-center gap-2 border border-yellow-500/20">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <p className="text-[11px] font-bold text-white text-center">You've fueled the guard. Thank you!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="rounded-xl font-bold h-12 text-[10px] border-secondary/30 flex flex-col gap-0.5" onClick={() => handleDonateInitiate("$3")}>
                <span>$3</span>
                <span className="text-[8px] font-normal opacity-60">Coffee</span>
              </Button>
              <Button variant="outline" className="rounded-xl font-bold h-12 text-[10px] border-secondary/30 flex flex-col gap-0.5" onClick={() => handleDonateInitiate("$5")}>
                <span>$5</span>
                <span className="text-[8px] font-normal opacity-60">Green Tea</span>
              </Button>
              <Button variant="outline" className="rounded-xl font-bold h-12 text-[10px] border-secondary/30 flex flex-col gap-0.5" onClick={() => handleDonateInitiate("$10+")}>
                <span>$10+</span>
                <span className="text-[8px] font-normal opacity-60">The Pot</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-muted/30 rounded-3xl p-6 border border-border">
        <p className="text-[11px] leading-relaxed text-muted-foreground font-bold italic">
          Informational tool only. No investment advice provided.
        </p>
      </div>

      <AlertDialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <AlertDialogContent className="rounded-[2rem] border-secondary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">A Token of Appreciation</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs">
              Redirecting to Razorpay for a contribution of <span className="font-bold text-white">{selectedAmount}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col gap-2">
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDonation(); }} disabled={isProcessing} className="bg-secondary text-white font-bold rounded-xl h-12">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Contribute ${selectedAmount}`}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl">Perhaps later</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
