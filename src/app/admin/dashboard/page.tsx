"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowLeft, 
  LogOut,
  CreditCard,
  Search,
  ShieldCheck,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const ALLOWED_ADMIN_EMAIL = "rupeshdeotale@gmail.com";

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/admin');
      } else if (user.email !== ALLOWED_ADMIN_EMAIL) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Revoked",
          description: "Unauthorized session detected.",
        });
        router.push('/admin');
      } else {
        setAuthenticated(true);
      }
    });

    return () => unsubscribeAuth();
  }, [router, toast]);

  useEffect(() => {
    if (!authenticated) return;

    const q = query(collection(db, "donations"), orderBy("timestamp", "desc"));
    const unsubscribePayments = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(p);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribePayments();
  }, [authenticated]);

  const totalRevenue = payments.reduce((acc, curr) => {
    const amountStr = curr.amount?.replace(/[^0-9.]/g, '') || '0';
    const val = parseFloat(amountStr);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const filteredPayments = payments.filter(p => 
    p.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authenticated || loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      <p className="text-muted-foreground animate-pulse font-black tracking-[0.3em] text-[10px] uppercase">Decrypting Ledger...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12 max-w-2xl mx-auto">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white leading-none">Ledger</h1>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Session: {auth.currentUser?.email}
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => signOut(auth)}
          className="rounded-full text-risk-crash hover:bg-risk-crash/10 hover:text-risk-crash"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-1 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Support</p>
          <p className="text-3xl font-black text-secondary">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-3xl p-6 space-y-1 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Events</p>
          <p className="text-3xl font-black text-white">{payments.length}</p>
        </div>
      </div>

      {/* Filter & Actions */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by amount or ID..." 
            className="pl-11 rounded-2xl bg-muted/10 border-border h-12 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 w-12 rounded-2xl border-border shrink-0">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredPayments.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center hover:border-secondary/30 transition-colors group">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-secondary/5 rounded-xl text-secondary group-hover:bg-secondary/10 transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{p.amount} Support</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  {p.timestamp?.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant="outline" className="text-[9px] font-black border-secondary/20 text-secondary bg-secondary/5 px-2">
                {p.mode || 'Investor'}
              </Badge>
              <span className="text-[8px] text-muted-foreground font-mono uppercase tracking-tighter">REF: {p.id.slice(0, 12)}</span>
            </div>
          </div>
        ))}

        {filteredPayments.length === 0 && (
          <div className="text-center py-20 bg-muted/5 rounded-[2.5rem] border border-dashed border-border">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">No records found in decryption</p>
          </div>
        )}
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[8px] text-muted-foreground/30 font-black uppercase tracking-[0.4em]">Audit Logging Enabled • Private Intelligence</p>
      </footer>
    </div>
  );
}