"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const ALLOWED_ADMIN_EMAIL = "rupeshdeotale@gmail.com";

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email !== ALLOWED_ADMIN_EMAIL) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This identity is not registered in the Master Registry. Entry logged.",
        });
        return;
      }

      toast({
        title: "Identity Verified",
        description: `Welcome back, ${user.displayName || 'Administrator'}.`,
      });
      
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Secure handshake could not be completed.",
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
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">Authorized Identity Required</p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/10 p-6 rounded-2xl border border-border text-center space-y-3">
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
              This terminal is restricted to the Master Administrator. Identity verification is handled via Google Secure SSO.
            </p>
          </div>

          <Button 
            onClick={handleGoogleLogin}
            className="w-full h-14 rounded-2xl bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </span>
            )}
          </Button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
            Identity managed by Google Authentication Services
          </p>
        </div>
      </div>
    </div>
  );
}