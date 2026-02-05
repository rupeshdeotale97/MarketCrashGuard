"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, Bell, ShieldAlert, ExternalLink, Heart, Check, Coffee, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SettingsPage() {
  const [isTrader, setIsTrader] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isSupporter, setIsSupporter] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Load supporter status from local storage
  useEffect(() => {
    const supporterStatus = localStorage.getItem('crashguard_supporter');
    if (supporterStatus === 'true') {
      setIsSupporter(true);
    }
    
    // Pre-load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleDonateInitiate = (amount: string) => {
    setSelectedAmount(amount);
    setShowDonationDialog(true);
  };

  const confirmDonation = () => {
    setIsProcessing(true);

    // RAZORPAY INTEGRATION LOGIC:
    // In a real app, you would:
    // 1. Create an order on your backend using Razorpay Node SDK.
    // 2. Pass the order_id here.
    
    const amountInPaise = parseInt(selectedAmount.replace('$', '')) * 100 * 80; // Approximate USD to INR for Razorpay demo

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Key ID from Razorpay Dashboard
      amount: amountInPaise,
      currency: "INR",
      name: "CrashGuard",
      description: `Support contribution: ${selectedAmount}`,
      image: "https://picsum.photos/seed/crashguard/200/200",
      handler: function (response: any) {
        // Payment successful!
        setIsSupporter(true);
        localStorage.setItem('crashguard_supporter', 'true');
        setIsProcessing(false);
        setShowDonationDialog(false);
        
        toast({
          title: "Payment Successful",
          description: `Transaction ID: ${response.razorpay_payment_id}. Thank you for your support!`,
        });
      },
      prefill: {
        name: "CrashGuard User",
        email: "user@example.com",
      },
      theme: {
        color: "#6d28d9", // secondary color
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    try {
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback if script didn't load (Prototype behavior)
        setTimeout(() => {
          setIsSupporter(true);
          localStorage.setItem('crashguard_supporter', 'true');
          setIsProcessing(false);
          setShowDonationDialog(false);
          toast({
            title: "Simulated Success",
            description: "Razorpay script was not found, but we've simulated a successful support contribution for this prototype.",
          });
        }, 1500);
      }
    } catch (e) {
      setIsProcessing(false);
      console.error("Razorpay error:", e);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
        {isSupporter && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full animate-in zoom-in duration-300">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Supporter</span>
          </div>
        )}
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
              <Bell className="w-5 h-5" />
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
        <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-[2rem] p-6 border border-secondary/20 space-y-5">
          <p className="text-xs leading-relaxed text-muted-foreground font-medium">
            CrashGuard is built to reduce panic and protect capital — not to sell trades or fear. If this app helps you stay disciplined, you can support ongoing development.
          </p>
          
          {isSupporter ? (
            <div className="bg-background/40 rounded-2xl p-4 flex flex-col items-center gap-2 border border-yellow-500/20">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Coffee className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-[11px] font-bold text-white text-center">You are a Supporter! Thank you for keeping the lights on.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="rounded-xl font-bold h-12 text-xs border-secondary/30 hover:bg-secondary/10" onClick={() => handleDonateInitiate("$3")}>$3</Button>
              <Button variant="outline" className="rounded-xl font-bold h-12 text-xs border-secondary/30 hover:bg-secondary/10" onClick={() => handleDonateInitiate("$5")}>$5</Button>
              <Button variant="outline" className="rounded-xl font-bold h-12 text-xs border-secondary/30 hover:bg-secondary/10" onClick={() => handleDonateInitiate("$10+")}>$10+</Button>
            </div>
          )}
          
          <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Powered by Razorpay • Voluntary Support
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
          <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Version 1.2.0 • Build 89</span>
        </div>
      </div>

      {/* Donation Confirmation Dialog */}
      <AlertDialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <AlertDialogContent className="rounded-[2rem] border-secondary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Support CrashGuard Development</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs leading-relaxed">
              You are about to contribute <span className="font-bold text-white">{selectedAmount}</span>. 
              Contributions are voluntary and keep the app independent. 
              <br/><br/>
              <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">Secure Payment:</span>
              This transaction is handled securely by Razorpay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col gap-2">
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDonation();
              }} 
              disabled={isProcessing}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl h-12"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                `Pay ${selectedAmount} via Razorpay`
              )}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl border-border hover:bg-muted/20">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
