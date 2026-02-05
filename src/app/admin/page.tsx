"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Securely authenticate via Firebase Identity Platform
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Authentication Successful",
        description: "Welcome to the Secure Terminal.",
      });
      
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid encrypted credentials. Entry logged.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5">
      <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Decorative security pattern */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />
        
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-4 bg-secondary/10 rounded-full text-secondary shadow-[0_0_20px_rgba(var(--secondary),0.2)]">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Terminal</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">Encrypted Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Registry Email</label>
            <div className="relative">
              <Input 
                type="email" 
                placeholder="admin@crashguard.security" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl h-12 bg-background border-border pl-4 focus:ring-secondary/50"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Security Key</label>
            <div className="relative">
              <Input 
                type="password" 
                placeholder="••••••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl h-12 bg-background border-border pl-4 focus:ring-secondary/50 font-mono"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-secondary/20"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Initialize Decryption
              </span>
            )}
          </Button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
            Identity managed by Firebase Security Systems
          </p>
        </div>
      </div>
    </div>
  );
}