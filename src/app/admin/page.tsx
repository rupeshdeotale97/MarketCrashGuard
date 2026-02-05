
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldLock, Loader2 } from 'lucide-react';
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid admin credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5">
      <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-4 bg-secondary/10 rounded-full text-secondary">
            <ShieldLock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Terminal</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Secure Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email</label>
            <Input 
              type="email" 
              placeholder="admin@crashguard.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-12 bg-background border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl h-12 bg-background border-border"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-sm"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate"}
          </Button>
        </form>
      </div>
    </div>
  );
}
